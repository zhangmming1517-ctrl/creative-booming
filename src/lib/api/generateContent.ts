import { chatCompletion, extractJSON } from "./aiClient";
import { CONTENT_GENERATION_PROMPT } from "../prompts/L1contentGeneration";
import type {
  AnalysisResult,
  GenerationResult,
  ContentVariant,
} from "../../types/content";

// ── 容错：校验并修正 AI 输出结构 ──
function validateResult(data: { variants?: Partial<ContentVariant>[] }): GenerationResult {
  const variants = (data.variants ?? [])
    .slice(0, 3)
    .filter((v) => v?.title && v?.body)
    .map((v, i) => ({
      id: v.id ?? i + 1,
      emotion_hook: v.emotion_hook ?? "获得感",
      title: v.title ?? "",
      body: v.body ?? "",
    })) as ContentVariant[];

  if (variants.length === 0) {
    throw new Error("AI 未能生成有效内容方案，请重试");
  }

  return { variants };
}

export async function generateContent(
  analysis: AnalysisResult
): Promise<GenerationResult> {
  const prompt = CONTENT_GENERATION_PROMPT({
    platform: analysis.platform,
    style: analysis.style,
    keywords: analysis.keywords,
    core_views: analysis.core_views,
  });

  const text = await chatCompletion(
    [{ role: "user", content: prompt }],
    { temperature: 0.9, jsonMode: true }  // 创作类任务适当提高多样性
  );

  const jsonStr = extractJSON(text);
  const parsed = JSON.parse(jsonStr) as { variants?: Partial<ContentVariant>[] };

  return validateResult(parsed);
}
