import { chatCompletion, extractJSON } from "./aiClient";
import { CONTENT_ANALYSIS_PROMPT } from "../prompts/L2contentAnalysis";
import type { AnalysisResult, PlatformType } from "../../types/content";

// ── 容错：校验并修正 AI 输出结构 ──
function validateResult(data: Partial<AnalysisResult>): AnalysisResult {
  return {
    platform: data.platform ?? "小红书",
    style: data.style ?? "生活分享",
    keywords: (data.keywords ?? []).slice(0, 8),        // 最多 8 个
    core_views: (data.core_views ?? [])
      .slice(0, 5)                                       // 最多 5 条
      .filter((v) => v?.title && v?.content),            // 过滤空值
  };
}

export async function analyzeContent(
  rawInput: string,
  platform: PlatformType = "小红书"
): Promise<AnalysisResult> {
  // 输入长度校验
  if (rawInput.trim().length < 50) {
    throw new Error("输入内容过短，请至少输入50个字");
  }
  const trimmedInput = rawInput.slice(0, 2000); // 超长截断

  const prompt = CONTENT_ANALYSIS_PROMPT(trimmedInput, platform);

  const text = await chatCompletion(
    [{ role: "user", content: prompt }],
    { temperature: 0.7, jsonMode: true }
  );

  const jsonStr = extractJSON(text);
  const parsed = JSON.parse(jsonStr) as Partial<AnalysisResult>;

  return validateResult(parsed);
}
