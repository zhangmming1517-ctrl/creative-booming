import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useLocation } from "react-router";
import { ChevronLeft, Sparkles, RefreshCw, MessageSquarePlus, Send, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { analyzeContent } from "../../lib/api/analyzeContent";
import { generateContent } from "../../lib/api/generateContent";
import type { ContentState } from "../../types/content";

export default function BrainstormingBoard() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ContentState | null;

  const [keywords, setKeywords] = useState<string[]>(
    state?.analysis?.keywords ?? []
  );
  const [insights, setInsights] = useState<{ title: string; content: string }[]>(
    state?.analysis?.core_views ?? []
  );
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(
    state?.selectedKeywords ?? state?.analysis?.keywords ?? []
  );
  const [feedback, setFeedback] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // 没有 AI 分析结果时引导返回
  if (!state?.analysis) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 gap-4 p-8">
        <p className="text-gray-500 text-center">未检测到分析结果，请先输入内容</p>
        <Button onClick={() => navigate("/input")} className="rounded-full px-8 bg-gradient-to-r from-blue-500 to-purple-500">
          返回输入
        </Button>
      </div>
    );
  }

  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords(prev =>
      prev.includes(keyword)
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };

  // 反馈优化：将原始输入 + 用户反馈重新调用 L2
  const handleRefine = async () => {
    if (!feedback.trim()) return;
    const rawInput = state?.rawInput ?? "";
    if (!rawInput) {
      setRefineError("无法读取原始输入，请返回上一步重试");
      return;
    }
    setIsRefining(true);
    setRefineError(null);
    try {
      const refinedInput = `${rawInput}\n\n---\n用户反馈：${feedback}\n请根据以上反馈重新优化关键词和核心观点。`;
      const result = await analyzeContent(refinedInput, state?.analysis?.platform ?? "小红书");
      setKeywords(result.keywords);
      setInsights(result.core_views.map(v => ({ title: v.title, content: v.content })));
      setSelectedKeywords(result.keywords);
      setFeedback("");
    } catch (err) {
      setRefineError(err instanceof Error ? err.message : "优化失败，请重试");
    } finally {
      setIsRefining(false);
    }
  };

  const handleNext = async () => {
    if (!state?.analysis) return;
    setIsGenerating(true);
    setGenerateError(null);
    try {
      const result = await generateContent({
        platform: state.analysis.platform,
        style: state.analysis.style,
        keywords: selectedKeywords.length > 0 ? selectedKeywords : state.analysis.keywords,
        core_views: insights,
      });
      navigate("/canvas", {
        state: {
          rawInput: state.rawInput,
          platform: state.analysis.platform,
          style: state.analysis.style,
          variants: result.variants,
        }
      });
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "生成失败，请重试");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-[calc(env(safe-area-inset-top)+1rem)] pb-6 bg-white/50 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/input")}
          className="rounded-full"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h2 className="text-xl font-semibold text-gray-800">内容提炼</h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 px-6 py-8">
        {/* Keywords Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-800">关键词</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">点击选择重点关键词</p>
          
          <div className="flex flex-wrap gap-3">
            {keywords.map((keyword, index) => (
              <motion.div
                key={keyword}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Badge
                  onClick={() => toggleKeyword(keyword)}
                  className={`px-4 py-2 text-base cursor-pointer transition-all ${
                    selectedKeywords.includes(keyword)
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                      : "bg-white/80 text-gray-700 hover:bg-white"
                  }`}
                >
                  {keyword}
                </Badge>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Insights Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-800">核心观点</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">AI 提炼的精华内容</p>

          <div className="space-y-4">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg"
              >
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs flex items-center justify-center">
                    {index + 1}
                  </span>
                  {insight.title}
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {insight.content}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 反馈优化 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <div className="flex items-center gap-2 mb-3">
            <MessageSquarePlus className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-800">反馈优化</h3>
          </div>
          <p className="text-sm text-gray-500 mb-3">
            对关键词或核心观点不满意？告诉 AI 你想要的方向
          </p>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value.slice(0, 200))}
              placeholder={"例如：少一些探店词，要更强调光影和气氛感。\n或者：希望添加地域标签，风格偏精致美学..."}
              className="w-full h-28 bg-transparent text-gray-800 placeholder-gray-300 text-sm leading-relaxed p-4 resize-none outline-none"
              disabled={isRefining}
            />
            <div className="flex items-center justify-between px-4 pb-3 border-t border-gray-100">
              <span className={`text-xs transition-colors ${
                feedback.length > 180 ? "text-orange-400" : "text-gray-300"
              }`}>
                {feedback.length} / 200
              </span>
              <motion.button
                onClick={handleRefine}
                disabled={!feedback.trim() || isRefining}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-400 to-pink-500 text-white text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed shadow-md"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {isRefining ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </motion.div>
                    AI 优化中...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    重新生成
                  </>
                )}
              </motion.button>
            </div>
          </div>

          <AnimatePresence>
            {refineError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-red-400 mt-2 px-1"
              >
                ⚠️ {refineError}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <AnimatePresence>
          {generateError && (
            <motion.p
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-xs text-red-400 mb-3 text-center"
            >
              ⚠️ {generateError}
            </motion.p>
          )}
        </AnimatePresence>
        <Button
          onClick={handleNext}
          disabled={isGenerating}
          className="w-full h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-lg shadow-xl disabled:opacity-60"
        >
          {isGenerating ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" />AI 生成中…</>
          ) : "生成内容"}
        </Button>
      </div>
    </div>
  );
}
