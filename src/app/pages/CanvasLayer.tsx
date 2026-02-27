import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useLocation } from "react-router";
import { ChevronLeft, Image as ImageIcon, Upload, Heart, Share2, Camera, Wand2, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { beautifyImage } from "../../lib/api/beautifyImage";
import type { ImageBeautificationResult, PlatformType, StyleType } from "../../types/content";

export default function CanvasLayer() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state as {
    rawInput?: string;
    platform?: string;
    style?: string;
    variants?: { id: number; emotion_hook: string; title: string; body: string }[];
  } | null;

  const [selectedTab, setSelectedTab] = useState("1");
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [imageGuide, setImageGuide] = useState<ImageBeautificationResult | null>(null);
  const [isLoadingGuide, setIsLoadingGuide] = useState(false);
  const [guideError, setGuideError] = useState<string | null>(null);
  const [copiedAigc, setCopiedAigc] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<"photo" | "aigc">("photo");

  // 从路由 state 读取 AI 生成的方案列表
  const variants = routeState?.variants ?? [];
  const titles = variants.length > 0
    ? variants.map(v => v.title)
    : ["方案 1", "方案 2", "方案 3"];

  const coverImage = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=600&fit=crop";

  // 当前选中方案的正文（随 selectedTab 动态变化）
  const content = variants.length > 0
    ? (variants[parseInt(selectedTab) - 1]?.body ?? "")
    : "";

  const handleNext = () => {
    navigate("/export", {
      state: {
        title: titles[parseInt(selectedTab) - 1],
        content,
        coverImage
      }
    });
  };

  // 触发 L3 配图美化
  const handleGenerateGuide = async () => {
    setIsLoadingGuide(true);
    setGuideError(null);
    try {
      const result = await beautifyImage({
        platform: (routeState?.platform ?? "小红书") as PlatformType,
        style: (routeState?.style ?? "生活分享") as StyleType,
        title: titles[parseInt(selectedTab) - 1],
        body: content,
      });
      setImageGuide(result);
    } catch (err) {
      setGuideError(err instanceof Error ? err.message : "生成失败，请重试");
    } finally {
      setIsLoadingGuide(false);
    }
  };

  const handleCopyAigc = async () => {
    if (!imageGuide) return;
    await navigator.clipboard.writeText(imageGuide.aigc_prompt.positive);
    setCopiedAigc(true);
    setTimeout(() => setCopiedAigc(false), 2000);
  };

  // 没有内容方案时引导返回
  if (variants.length === 0) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 gap-4 p-8">
        <p className="text-gray-500 text-center">未检测到内容方案，请返回上一步</p>
        <Button onClick={() => navigate("/brainstorm")} className="rounded-full px-8 bg-gradient-to-r from-pink-500 to-orange-500">
          返回内容提炼
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-[calc(env(safe-area-inset-top)+1rem)] pb-6 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/brainstorm")}
          className="rounded-full"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h2 className="text-xl font-semibold text-gray-800">内容预览</h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 px-6 py-8">
        {/* Title Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-3">选择标题方案</h3>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="w-full h-auto bg-white/80 backdrop-blur-sm p-2 rounded-2xl">
              {titles.map((_, index) => (
                <TabsTrigger 
                  key={index} 
                  value={String(index + 1)}
                  className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-orange-500 data-[state=active]:text-white rounded-xl"
                >
                  方案 {index + 1}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Phone Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md mx-auto"
        >
          {/* Cover Image */}
          <div className="relative aspect-[3/4] bg-gray-200 overflow-hidden">
            <img 
              src={coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <Button
              onClick={() => setShowImageMenu(!showImageMenu)}
              className="absolute bottom-4 right-4 rounded-full bg-white/90 text-gray-800 hover:bg-white shadow-lg"
              size="sm"
            >
              <ImageIcon className="w-4 h-4 mr-1" />
              更换图片
            </Button>

            {/* Image Menu */}
            <AnimatePresence>
              {showImageMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-20 right-4 bg-white rounded-2xl shadow-xl p-3 space-y-2"
                >
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    AI 生成图片
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Upload className="w-4 h-4 mr-2" />
                    上传实拍图
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Content Area */}
          <div className="p-5">
            {/* Title */}
            <AnimatePresence mode="wait">
              <motion.h3
                key={selectedTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="font-semibold text-lg text-gray-900 mb-3"
              >
                {titles[parseInt(selectedTab) - 1]}
              </motion.h3>
            </AnimatePresence>

            {/* Stats */}
            <div className="flex items-center gap-6 mb-4 text-gray-600">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span className="text-sm">2.3k</span>
              </div>
              <div className="flex items-center gap-1">
                <Share2 className="w-4 h-4" />
                <span className="text-sm">186</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 fill-pink-400 text-pink-400" />
                <span className="text-sm">92</span>
              </div>
            </div>

            {/* Content Preview */}
            <div className="text-sm text-gray-700 leading-relaxed mb-4 whitespace-pre-line max-h-48 overflow-y-auto">
              {content}
            </div>

            {/* L3 配图美化区域 */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">配图美化指导</h4>
                {!imageGuide && (
                  <Button
                    size="sm"
                    onClick={handleGenerateGuide}
                    disabled={isLoadingGuide}
                    className="h-7 text-xs rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 border-0"
                  >
                    {isLoadingGuide ? (
                      <><Loader2 className="w-3 h-3 mr-1 animate-spin" />生成中...</>
                    ) : (
                      <><Wand2 className="w-3 h-3 mr-1" />AI 生成指导</>
                    )}
                  </Button>
                )}
              </div>

              {/* 错误提示 */}
              <AnimatePresence>
                {guideError && (
                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-xs text-red-400 mb-2"
                  >
                    ⚠️ {guideError}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* 配图美化结果面板 */}
              <AnimatePresence>
                {imageGuide && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {/* 选项切换 */}
                    <div className="flex gap-1 mb-3 bg-gray-100 rounded-xl p-1">
                      <button
                        onClick={() => setActiveGuideTab("photo")}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                          activeGuideTab === "photo"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500"
                        }`}
                      >
                        <Camera className="w-3 h-3" />选项 A 实拍指导
                      </button>
                      <button
                        onClick={() => setActiveGuideTab("aigc")}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                          activeGuideTab === "aigc"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500"
                        }`}
                      >
                        <Wand2 className="w-3 h-3" />选项 B AI 绘图
                      </button>
                    </div>

                    {/* 选项 A：实拍指导 */}
                    {activeGuideTab === "photo" && (
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="space-y-2"
                      >
                        {([
                          { label: "🎨 情绪基调", value: imageGuide.photography_guide.emotion },
                          { label: "📸 构图留白", value: imageGuide.photography_guide.breathing_space },
                          { label: "✨ 真实感", value: imageGuide.photography_guide.authenticity },
                          { label: "☀️ 光源方向", value: imageGuide.photography_guide.light_direction },
                          { label: "🎥 色调方向", value: imageGuide.photography_guide.color_tone },
                        ] as const).map(({ label, value }) => (
                          <div key={label} className="bg-gray-50 rounded-xl p-3">
                            <span className="text-xs font-semibold text-gray-500 block mb-0.5">{label}</span>
                            <span className="text-xs text-gray-700 leading-relaxed">{value}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {/* 选项 B：AIGC 提示词 */}
                    {activeGuideTab === "aigc" && (
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="space-y-2"
                      >
                        <div className="bg-purple-50 rounded-xl p-3 relative">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-semibold text-purple-600">正向提示词</span>
                            <button
                              onClick={handleCopyAigc}
                              className="flex items-center gap-1 text-xs text-purple-500 hover:text-purple-700"
                            >
                              {copiedAigc ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              {copiedAigc ? "已复制" : "复制"}
                            </button>
                          </div>
                          <p className="text-xs text-gray-700 leading-relaxed font-mono">{imageGuide.aigc_prompt.positive}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <span className="text-xs font-semibold text-gray-500 block mb-1">负向提示词</span>
                          <p className="text-xs text-gray-500 font-mono">{imageGuide.aigc_prompt.negative}</p>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1 bg-gray-50 rounded-xl p-2.5 text-center">
                            <span className="text-xs text-gray-400 block">画面比例</span>
                            <span className="text-sm font-bold text-gray-800">{imageGuide.aigc_prompt.ratio}</span>
                          </div>
                          <div className="flex-1 bg-gray-50 rounded-xl p-2.5 text-center">
                            <span className="text-xs text-gray-400 block">风格参考</span>
                            <span className="text-sm font-bold text-gray-800">{imageGuide.aigc_prompt.style_ref}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200 px-6 pt-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
        <Button
          onClick={handleNext}
          className="w-full h-14 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-lg shadow-xl"
        >
          确认并导出
        </Button>
      </div>
    </div>
  );
}
