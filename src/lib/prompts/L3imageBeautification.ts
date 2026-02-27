import type { StyleType, PlatformType, ImageBeautificationInput } from "../../types/content";

// 风格 → AI 绘图关键词映射表
const STYLE_AIGC_KEYWORDS: Record<StyleType, string> = {
  生活分享:
    "first-person perspective, handheld camera feel, authentic lifestyle scene, slightly cluttered desk, natural daylight, crisp details, action in progress",
  经验实操:
    "first-person perspective, handheld camera feel, authentic lifestyle scene, slightly cluttered desk, natural daylight, crisp details, action in progress",
  精致美学:
    "cinematic mood, atmospheric light, premium color grading, minimalist composition, soft focus, material texture, light and shadow layers",
  情感力量传递:
    "emotional portrait, catchlight in eyes, storytelling, candid moment, solitude, warm embrace, nostalgic color tone",
  随笔风:
    "life fragments, candid shot, everyday moment, slightly overexposed, film grain, frame border, date watermark, messy but warm",
  知识干货分享:
    "bright lighting, high detail, before-after comparison, clean background, educational atmosphere, clear typography, structured layout",
};

export const IMAGE_BEAUTIFICATION_PROMPT = ({
  platform,
  style,
  title,
  body,
}: ImageBeautificationInput): string => `
**Role:** 你是一位审美极佳、深谙社媒视觉心理学的资深设计总监。了解不同平台（小红书/抖音）的爆款排版公式，擅长将文字转化为极具张力的视觉语言。

**Task:** 针对以下已生成的标题和文案，提供两种视觉执行方案（用户实拍指导 & AI 绘图指令）。

---

## 输入内容

- **目标平台：** ${platform}
- **内容风格：** ${style}
- **标题：** ${title}
- **文案：**
${body}

---

## 视觉方案生成逻辑

### 选项 A：用户上传照片（Photography Guide）

**核心目标：** 引导用户选择与文案意境最匹配的实拍素材。

请提供具体的选片建议，至少覆盖以下五个维度：
1. **情绪**：画面传达的核心情绪基调
2. **呼吸感**：构图留白与空间处理建议
3. **真实感**：如何在保持质感的同时体现真实性
4. **光源方向**：最佳拍摄光位及时间段建议
5. **色调**：主色调与辅助色参考，以及后期调色方向

### 选项 B：AI 绘图指令（AIGC Prompt）

**核心目标：** 输出可直接复制到文生图软件（Midjourney / Stable Diffusion / 即梦）的专业高命中率提示词。

当前风格（${style}）的基底关键词参考：
${STYLE_AIGC_KEYWORDS[style]}

请在基底关键词之上，结合标题与文案的具体意境进行扩写，生成一段完整的英文绘图提示词。

---

## 输出要求

严格按照以下 JSON 格式输出，不要包含任何额外说明文字：

{
  "photography_guide": {
    "emotion": "情绪基调描述",
    "breathing_space": "构图留白建议",
    "authenticity": "真实感拍摄指导",
    "light_direction": "光源方向与时间段",
    "color_tone": "色调与后期调色方向"
  },
  "aigc_prompt": {
    "positive": "完整英文正向提示词（含风格、构图、光线、色调、主体等）",
    "negative": "负向提示词（需排除的元素，如 blurry, watermark, text, oversaturated 等）",
    "ratio": "推荐画面比例（如 9:16 / 1:1 / 3:4）",
    "style_ref": "风格参考（如 photography, illustration, flat design 等）"
  }
}
`;
