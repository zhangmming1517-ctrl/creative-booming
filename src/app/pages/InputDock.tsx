import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { Mic, Send, ChevronLeft, X, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { analyzeContent } from "../../lib/api/analyzeContent";
import type { ContentState } from "../../types/content";

/**
 * 录音粒子组件
 * 实现“散开、集合”的动态科技感
 */
const RecordingParticle = ({ index, total }: { index: number; total: number }) => {
  const angle = (index / total) * Math.PI * 2;
  // 随机化一些参数使效果更自然
  const randomFactor = useRef(Math.random()).current;
  const scatterDistance = 80 + randomFactor * 40;
  const gatherDistance = 35 + randomFactor * 10;
  
  return (
    <motion.div
      className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400"
      initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
      animate={{ 
        // 关键帧序列：静止 -> 猛然散开 -> 缓慢向中心集合 -> 回到中心
        x: [
          0, 
          Math.cos(angle) * scatterDistance, 
          Math.cos(angle) * gatherDistance,
          0
        ],
        y: [
          0, 
          Math.sin(angle) * scatterDistance, 
          Math.sin(angle) * gatherDistance,
          0
        ],
        scale: [0, 1.5, 0.8, 0],
        opacity: [0, 1, 0.6, 0],
      }}
      transition={{ 
        duration: 3, 
        repeat: Infinity, 
        ease: "easeInOut",
        delay: (index * 0.08) % 1.5 // 交错发射感
      }}
      style={{
        boxShadow: "0 0 12px rgba(34, 211, 238, 0.9)",
        filter: "blur(0.5px)"
      }}
    />
  );
};

export default function InputDock() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const particlesCount = 64; // 增加粒子数量增强视觉冲击力

  const recognitionRef = useRef<any>(null);

  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setApiError("您的浏览器不支持语音识别，请更换 Chrome 或 Edge 浏览器。");
      return;
    }

    // 每次启动都创建一个新的识别实例，这在某些浏览器上更稳定
    const recognition = new SpeechRecognition();
    recognition.lang = "zh-CN";
    recognition.continuous = true;
    recognition.interimResults = true;

    // 记录开始录音前的文本，以便追加
    const baseInput = input;

    recognition.onstart = () => {
      setIsRecording(true);
      setApiError(null);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        interimTranscript += event.results[i][0].transcript;
      }
      // 将识别结果追加到原有文本
      setInput(baseInput + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === 'not-allowed') {
        setApiError("麦克风权限已拒绝，请在浏览器设置中开启。");
      } else if (event.error !== 'aborted') {
        setApiError(`语音识别错误: ${event.error}`);
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start recognition:", e);
      setIsRecording(false);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      // 使用 abort() 立即停止并释放资源
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const handleMicToggle = () => {
    if (!isRecording) {
      startSpeechRecognition();
    } else {
      stopSpeechRecognition();
    }
  };

  const [apiError, setApiError] = useState<string | null>(null);

  const handleNext = async () => {
    if (!input.trim()) return;
    setIsSubmitting(true);
    setApiError(null);
    try {
      const analysis = await analyzeContent(input, "小红书");
      const state: ContentState = {
        rawInput: input,
        analysis,
        selectedKeywords: [...analysis.keywords],
      };
      navigate("/brainstorm", { state });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "AI 分析失败，请重试";
      setApiError(msg);
      console.error("analyzeContent error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full bg-[#050505] text-white flex flex-col relative overflow-hidden font-sans">
      {/* 氛围背景装饰 */}
      <div className="absolute top-[-15%] left-[-10%] w-[70%] h-[70%] bg-indigo-900/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[70%] h-[70%] bg-purple-900/10 blur-[150px] rounded-full" />

      {/* 顶部导航 */}
      <div className="z-10 flex items-center justify-between p-6 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="rounded-full bg-white/5 border border-white/10 hover:bg-white/10"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-sm font-bold tracking-[0.1em]">灵感捕捉</span>
          </div>
          <span className="text-[9px] text-white/30 uppercase tracking-[0.2em] mt-0.5 font-bold">Inspiration Studio</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setInput("")}
          className="rounded-full bg-white/5 border border-white/10 hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* 主输入区域 */}
      <div className="flex-1 flex flex-col px-6 pt-12 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col bg-gradient-to-b from-white/10 to-white/5 rounded-[3rem] border border-white/10 backdrop-blur-3xl p-8 relative overflow-hidden shadow-2xl group"
        >
          {/* 边缘流光效果 */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="点击麦克风说出你的创意，或者在这里直接输入文字..."
            className="w-full h-full min-h-[350px] border-0 focus-visible:ring-0 p-0 text-xl font-light leading-relaxed bg-transparent placeholder:text-white/10 resize-none scrollbar-none selection:bg-cyan-500/30"
          />

          {/* 生成中状态遮罩 */}
          <AnimatePresence>
            {isSubmitting && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center z-30"
              >
                <div className="relative w-16 h-16">
                   <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                   <motion.div
                     animate={{ rotate: 360 }}
                     transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                     className="absolute inset-0 rounded-full border-2 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent"
                   />
                </div>
                <p className="mt-8 text-sm font-bold tracking-[0.4em] text-white/80 animate-pulse">正在激活 AI 大脑...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 底部交互控制台 */}
        <div className="mt-16 mb-12 flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            {/* 粒子动画容器 */}
            <AnimatePresence>
              {isRecording && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {[...Array(particlesCount)].map((_, i) => (
                    <RecordingParticle key={i} index={i} total={particlesCount} />
                  ))}
                  
                  {/* 外溢冲击波 */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [0.8, 2.2], opacity: [0.4, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    className="absolute w-32 h-32 rounded-full border border-cyan-400/20"
                  />
                </div>
              )}
            </AnimatePresence>

            {/* 核心录音按钮 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMicToggle}
              className={`relative z-20 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-700 ${
                isRecording 
                ? "bg-red-500 shadow-[0_0_60px_rgba(239,68,68,0.5)] scale-110" 
                : "bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 shadow-[0_20px_50px_rgba(79,70,229,0.4)]"
              }`}
            >
              <AnimatePresence mode="wait">
                {isRecording ? (
                  <motion.div 
                    key="stop"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="w-8 h-8 bg-white rounded-lg shadow-inner"
                  />
                ) : (
                  <motion.div
                    key="mic"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    <Mic className="w-10 h-10 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* 录音时的呼吸内环 */}
              {isRecording && (
                <motion.div 
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-white/10"
                />
              )}
            </motion.button>

            {/* 发送/下一步按钮 (浮动右侧) */}
            <motion.button
              initial={{ x: 20, opacity: 0 }}
              animate={{ 
                x: input.trim() && !isRecording ? 100 : 20, 
                opacity: input.trim() && !isRecording ? 1 : 0,
                pointerEvents: input.trim() && !isRecording ? "auto" : "none"
              }}
              onClick={handleNext}
              className="absolute w-16 h-16 rounded-2xl bg-white text-black flex items-center justify-center shadow-2xl hover:bg-slate-100 transition-all active:scale-90"
            >
              <Send className="w-7 h-7" />
            </motion.button>
          </div>

          {/* API 错误提示 */}
          <AnimatePresence>
            {apiError && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-xs text-red-400 text-center tracking-wide"
              >
                ⚠️ {apiError}
              </motion.p>
            )}
          </AnimatePresence>

          {/* 状态文字提示 */}
          <div className="mt-10 text-center h-6">
            <AnimatePresence mode="wait">
              {isRecording ? (
                <motion.p
                  key="rec"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm font-bold tracking-[0.2em] text-cyan-400 flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  正在捕捉灵感粒子...
                </motion.p>
              ) : (
                <motion.p
                  key="idle"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm font-medium tracking-[0.1em] text-white/30"
                >
                  {input.trim() ? "捕捉完成，准备生成内容" : "点击麦克风开启 AI 创作"}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 底部装饰条 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-10">
        <div className="w-12 h-1 bg-white rounded-full" />
        <div className="w-1.5 h-1.5 bg-white rounded-full" />
        <div className="w-1.5 h-1.5 bg-white rounded-full" />
      </div>
    </div>
  );
}
