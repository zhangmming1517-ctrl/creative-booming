import { chatCompletion, extractJSON } from "./aiClient";
import { IMAGE_BEAUTIFICATION_PROMPT } from "../prompts/L3imageBeautification";
import type {
  ImageBeautificationResult,
  ImageBeautificationInput,
  PhotographyGuide,
  AigcPrompt,
} from "../../types/content";

// ── 容错：校验并修正 AI 输出结构 ──
function validateResult(
  data: Partial<ImageBeautificationResult>
): ImageBeautificationResult {
  const guide = data.photography_guide ?? ({} as Partial<PhotographyGuide>);
  const aigc = data.aigc_prompt ?? ({} as Partial<AigcPrompt>);

  return {
    photography_guide: {
      emotion: guide.emotion ?? "",
      breathing_space: guide.breathing_space ?? "",
      authenticity: guide.authenticity ?? "",
      light_direction: guide.light_direction ?? "",
      color_tone: guide.color_tone ?? "",
    },
    aigc_prompt: {
      positive: aigc.positive ?? "",
      negative: aigc.negative ?? "blurry, watermark, text overlay, oversaturated, deformed",
      ratio: aigc.ratio ?? "9:16",
      style_ref: aigc.style_ref ?? "photography",
    },
  };
}

export async function beautifyImage(
  input: ImageBeautificationInput
): Promise<ImageBeautificationResult> {
  const prompt = IMAGE_BEAUTIFICATION_PROMPT(input);

  const text = await chatCompletion(
    [{ role: "user", content: prompt }],
    { temperature: 0.75, jsonMode: true }
  );

  const jsonStr = extractJSON(text);
  const parsed = JSON.parse(jsonStr) as Partial<ImageBeautificationResult>;

  return validateResult(parsed);
}
