/**
 * 统一 AI 客户端
 * 支持所有兼容 OpenAI Chat Completions 接口的模型：
 *   - DeepSeek:  VITE_AI_BASE_URL=https://api.deepseek.com/v1
 *   - Kimi:      VITE_AI_BASE_URL=https://api.moonshot.cn/v1
 *   - 豆包:      VITE_AI_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
 *   - OpenAI:    VITE_AI_BASE_URL=https://api.openai.com/v1 (默认)
 *
 * 只需修改 .env.local 中的三个变量，无需改动任何业务代码。
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AiClientOptions {
  temperature?: number;
  /** 是否强制 JSON 输出（DeepSeek/Kimi/豆包/OpenAI 均支持） */
  jsonMode?: boolean;
}

// ── 读取配置（优先从 localStorage 读取用户自定义 Key，其次读环境变量） ──
function getConfig() {
  const envApiKey = import.meta.env.VITE_AI_API_KEY as string | undefined;
  // 支持用户在界面上手动输入的 Key
  const userApiKey = localStorage.getItem("USER_AI_API_KEY");
  
  const apiKey = userApiKey || envApiKey;
  
  const baseUrl =
    (import.meta.env.VITE_AI_BASE_URL as string | undefined) ??
    "https://api.openai.com/v1";
  const model =
    (import.meta.env.VITE_AI_MODEL as string | undefined) ?? "gpt-4o-mini";

  if (!apiKey || (apiKey.startsWith("your_") && !userApiKey)) {
    throw new Error("请在主页设置 AI API Key，或联系管理员配置 .env.local");
  }

  return { apiKey, baseUrl, model };
}

/**
 * 发送对话请求，返回模型的文本回复
 */
export async function chatCompletion(
  messages: ChatMessage[],
  options: AiClientOptions = {}
): Promise<string> {
  const { apiKey, baseUrl, model } = getConfig();
  const { temperature = 0.7, jsonMode = false } = options;

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature,
  };

  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`[aiClient] ${model} API Error:`, errText);
    throw new Error(`AI 服务请求失败 (${response.status})`);
  }

  const data = await response.json();
  const text: string = data.choices?.[0]?.message?.content ?? "";

  if (!text) {
    throw new Error("AI 返回内容为空，请重试");
  }

  return text;
}

/**
 * 从 AI 回复中提取 JSON（容错处理 markdown 代码块）
 */
export function extractJSON(raw: string): string {
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) return match[1].trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start !== -1 && end !== -1) return raw.slice(start, end + 1);
  return raw.trim();
}
