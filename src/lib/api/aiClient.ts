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

// ── 读取环境变量 ──
function getInsecureConfig() {
  const apiKey = import.meta.env.VITE_AI_API_KEY as string | undefined;
  const baseUrl = (import.meta.env.VITE_AI_BASE_URL as string | undefined) ?? "https://api.openai.com/v1";
  const model = (import.meta.env.VITE_AI_MODEL as string | undefined) ?? "gpt-4o-mini";
  
  const isDummy = !apiKey || apiKey.startsWith("your_");
  return { apiKey, baseUrl, model, isDummy };
}

/**
 * 发送对话请求，返回模型的文本回复
 */
export async function chatCompletion(
  messages: ChatMessage[],
  options: AiClientOptions = {}
): Promise<string> {
  const { temperature = 0.7, jsonMode = false } = options;
  const config = getInsecureConfig();

  // 如果本地存在 VITE_AI_API_KEY，且不是占位符，执行直接调用（仅供开发本地调试，不安全）
  if (!config.isDummy) {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature,
        response_format: jsonMode ? { type: "json_object" } : undefined,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[aiClient-local] Error:`, errText);
      throw new Error(`AI 请求失败 (${response.status})`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? "";
  } 

  // ── 安全模式：通过 Vercel Serverless 后端中转 ──
  // 解决 CORS（跨域）问题，并保护 API Key 不被泄露到浏览器前端
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      temperature,
      response_format: jsonMode ? { type: "json_object" } : undefined,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    console.error(`[aiClient-server] Proxy Error:`, errData);
    throw new Error(`AI 服务暂时不可用，请确认服务器端 API Key 是否配置正确 (${response.status})`);
  }

  const data = await response.json();
  const text: string = data.choices?.[0]?.message?.content ?? "";

  if (!text) throw new Error("AI 返回内容为空，请重试");
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
