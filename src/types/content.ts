export type PlatformType = "小红书" | "抖音" | "微博" | "公众号" | "视频号";

export type StyleType =
  | "生活分享"
  | "经验实操"
  | "精致美学"
  | "情感力量传递"
  | "随笔风"
  | "知识干货分享";

export interface CoreView {
  title: string;
  content: string;
}

export interface AnalysisResult {
  platform: PlatformType;
  style: StyleType;
  keywords: string[];   // 5-8 个标签
  core_views: CoreView[]; // 3-5 个核心观点
}

// InputDock 传递给 BrainstormingBoard 的完整 State
export interface ContentState {
  rawInput: string;             // 用户原始输入
  analysis: AnalysisResult;     // AI 分析结果
  selectedKeywords: string[];   // 用户选中的关键词
}

// ── Layer 1: 文案生成输出类型 ──

export type EmotionHook = "焦虑感" | "获得感" | "共鸣感" | "自由感";

export interface ContentVariant {
  id: number;
  emotion_hook: EmotionHook;
  title: string;   // 含 Emoji 的爆款标题
  body: string;    // 完整博文正文
}

export interface GenerationResult {
  variants: ContentVariant[];  // 3 套差异化方案
}

// BrainstormingBoard 传递给 CanvasLayer 的 State
export interface GenerationState {
  analysis: AnalysisResult;
  generation: GenerationResult;
  selectedVariantId: number;   // 用户选中的方案 id
}

// ── Layer 3: 配图美化输出类型 ──

export interface ImageBeautificationInput {
  platform: PlatformType;
  style: StyleType;
  title: string;   // 用户选定的最终标题
  body: string;    // 用户选定的最终文案
}

export interface PhotographyGuide {
  emotion: string;           // 情绪基调
  breathing_space: string;   // 构图留白建议
  authenticity: string;      // 真实感拍摄指导
  light_direction: string;   // 光源方向与时间段
  color_tone: string;        // 色调与后期调色方向
}

export interface AigcPrompt {
  positive: string;    // 正向提示词（英文）
  negative: string;    // 负向提示词
  ratio: string;       // 推荐画面比例（如 9:16）
  style_ref: string;   // 风格参考
}

export interface ImageBeautificationResult {
  photography_guide: PhotographyGuide;
  aigc_prompt: AigcPrompt;
}

// CanvasLayer 传递给 ActionBar 的 State
export interface ExportState {
  analysis: AnalysisResult;
  selectedVariant: ContentVariant;
  imageBeautification: ImageBeautificationResult;
}
