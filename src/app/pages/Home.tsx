import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { Sparkles, Zap, Wand2, Target, Settings, Key } from "lucide-react";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function Home() {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState("");
  const [isSettingOpen, setIsSettingOpen] = useState(false);

  useEffect(() => {
    // 初始化读取本地存储的 Key
    const savedKey = localStorage.getItem("USER_AI_API_KEY");
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem("USER_AI_API_KEY", apiKey.trim());
      setIsSettingOpen(false);
    } else {
      localStorage.removeItem("USER_AI_API_KEY");
    }
  };

  const features = [
    {
      icon: Sparkles,
      title: "AI 灵感捕捉",
      description: "说出你的想法，AI 帮你整理"
    },
    {
      icon: Wand2,
      title: "智能提炼",
      description: "自动提取核心观点和金句"
    },
    {
      icon: Target,
      title: "多平台适配",
      description: "小红书、抖音一键生成"
    },
    {
      icon: Zap,
      title: "所见即所得",
      description: "实时预览最终效果"
    }
  ];

  return (
    <div className="min-h-full bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex flex-col">
      {/* Header */}
      <motion.div 
        className="pt-[calc(env(safe-area-inset-top)+4rem)] px-6 text-center relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* 设置按钮 */}
        <div className="absolute top-[calc(env(safe-area-inset-top)+1rem)] right-6">
          <Dialog open={isSettingOpen} onOpenChange={setIsSettingOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="w-12 h-12 rounded-full bg-white/30 hover:bg-white/50 backdrop-blur-md shadow-sm p-0">
                <Key className="w-7 h-7 text-gray-800" />
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[320px] max-w-[calc(100vw-3rem)] rounded-2xl p-6">
              <DialogHeader>
                <DialogTitle className="text-center text-lg">配置 AI 密钥</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="apiKey" className="text-left font-medium">
                    API Key
                  </Label>
                  <Input
                    id="apiKey"
                    placeholder="请输入Kimi API KEY"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="col-span-3 h-10"
                  />
                  <p className="text-xs text-gray-500">
                    密钥将仅存储在您的本地浏览器中，用于直接请求 AI 服务。
                  </p>
                </div>
              </div>
              <Button onClick={handleSaveKey} className="h-10 w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium">
                保存配置
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        <motion.div
          className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 mb-6 shadow-2xl"
          animate={{ 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
        >
          <Sparkles className="w-10 h-10 text-white" />
        </motion.div>
        
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          内容创作助手
        </h1>
        <p className="text-gray-600 text-lg mb-2">
          让 AI 帮你轻松创作爆款内容
        </p>
      </motion.div>

      {/* Features Grid */}
      <motion.div 
        className="flex-1 px-6 py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center mb-3">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA Button */}
      <motion.div 
        className="px-6 pb-[calc(env(safe-area-inset-bottom)+3rem)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <Button
          onClick={() => navigate("/input")}
          className="w-full max-w-md mx-auto block h-16 text-lg rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 shadow-2xl"
        >
          <motion.span
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            开始生成
          </motion.span>
        </Button>
      </motion.div>
    </div>
  );
}
