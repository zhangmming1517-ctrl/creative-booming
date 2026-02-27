import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { Sparkles, Zap, Wand2, Target, Key } from "lucide-react";
import { Button } from "../components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

export default function Home() {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("https://api.openai.com/v1");
  const [model, setModel] = useState("gpt-4o-mini");
  const [modelPreset, setModelPreset] = useState("gpt-4o-mini");
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const [testSuccess, setTestSuccess] = useState(false);
  const [isSettingOpen, setIsSettingOpen] = useState(false);

  const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, "");

  const setModelByPreset = (preset: string) => {
    setModelPreset(preset);
    if (preset !== "custom") {
      setModel(preset);
    }
  };

  useEffect(() => {
    // 初始化读取本地存储的 Key
    const savedKey = localStorage.getItem("USER_AI_API_KEY");
    if (savedKey) setApiKey(savedKey);

    const savedBaseUrl = localStorage.getItem("USER_AI_BASE_URL");
    if (savedBaseUrl) setBaseUrl(savedBaseUrl);

    const savedModel = localStorage.getItem("USER_AI_MODEL");
    if (savedModel) {
      setModel(savedModel);
      const modelOptions = ["gpt-4o-mini", "gpt-4.1-mini", "moonshot-v1-8k", "deepseek-chat"];
      setModelPreset(modelOptions.includes(savedModel) ? savedModel : "custom");
    }
  }, []);

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem("USER_AI_API_KEY", apiKey.trim());
    } else {
      localStorage.removeItem("USER_AI_API_KEY");
    }

    if (baseUrl.trim()) {
      localStorage.setItem("USER_AI_BASE_URL", baseUrl.trim());
    } else {
      localStorage.removeItem("USER_AI_BASE_URL");
    }

    if (model.trim()) {
      localStorage.setItem("USER_AI_MODEL", model.trim());
    } else {
      localStorage.removeItem("USER_AI_MODEL");
    }

    setTestMessage(null);

    setIsSettingOpen(false);
  };

  const applyPreset = (provider: "openai" | "kimi" | "deepseek") => {
    switch (provider) {
      case "openai":
        setBaseUrl("https://api.openai.com/v1");
        setModelByPreset("gpt-4o-mini");
        break;
      case "kimi":
        setBaseUrl("https://api.moonshot.cn/v1");
        setModelByPreset("moonshot-v1-8k");
        break;
      case "deepseek":
        setBaseUrl("https://api.deepseek.com");
        setModelByPreset("deepseek-chat");
        break;
    }
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestSuccess(false);
      setTestMessage("请先填写 API Key");
      return;
    }
    if (!baseUrl.trim()) {
      setTestSuccess(false);
      setTestMessage("请先填写 Base URL");
      return;
    }
    if (!model.trim()) {
      setTestSuccess(false);
      setTestMessage("请先选择或输入模型");
      return;
    }

    setIsTestingConnection(true);
    setTestMessage(null);

    try {
      const response = await fetch(`${normalizeBaseUrl(baseUrl.trim())}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: model.trim(),
          messages: [{ role: "user", content: "ping" }],
          temperature: 1,
          max_tokens: 8,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`连接失败 (${response.status}) ${errText || "请检查配置"}`);
      }

      setTestSuccess(true);
      setTestMessage("连接成功，可以开始生成内容");
    } catch (error) {
      setTestSuccess(false);
      if (error instanceof TypeError) {
        setTestMessage("网络不可达，请检查网络/代理/VPN，或确认 Base URL 可访问");
      } else {
        setTestMessage(error instanceof Error ? error.message : "连接测试失败");
      }
    } finally {
      setIsTestingConnection(false);
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
                <DialogTitle className="text-center text-lg">配置 AI 服务</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                
                {/* 快捷按钮 */}
                <div className="flex gap-2 justify-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-8 px-2"
                    onClick={() => applyPreset("kimi")}
                  >
                    Kimi (Moonshot)
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-8 px-2"
                    onClick={() => applyPreset("deepseek")}
                  >
                    DeepSeek
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-8 px-2"
                    onClick={() => applyPreset("openai")}
                  >
                    OpenAI
                  </Button>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="baseUrl" className="text-left font-medium">
                    Base URL (API地址)
                  </Label>
                  <Input
                    id="baseUrl"
                    placeholder="https://api.openai.com/v1"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    className="col-span-3 h-10 text-xs"
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="text-left font-medium">模型选择</Label>
                  <Select value={modelPreset} onValueChange={setModelByPreset}>
                    <SelectTrigger className="h-10 text-xs">
                      <SelectValue placeholder="请选择模型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o-mini">OpenAI - gpt-4o-mini</SelectItem>
                      <SelectItem value="gpt-4.1-mini">OpenAI - gpt-4.1-mini</SelectItem>
                      <SelectItem value="moonshot-v1-8k">Kimi - moonshot-v1-8k</SelectItem>
                      <SelectItem value="deepseek-chat">DeepSeek - deepseek-chat</SelectItem>
                      <SelectItem value="custom">自定义模型</SelectItem>
                    </SelectContent>
                  </Select>
                  {modelPreset === "custom" && (
                    <Input
                      placeholder="输入自定义模型名，例如 kimi-k2-0711-preview"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="h-10 text-xs"
                    />
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="apiKey" className="text-left font-medium">
                    API Key (密钥)
                  </Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="请输入 sk-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="col-span-3 h-10 text-xs"
                  />
                  <p className="text-[10px] text-gray-500 leading-tight">
                    密钥仅保存在您的浏览器本地缓存中，直接请求 AI 服务提供商接口。
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={isTestingConnection}
                  className="h-10 rounded-full text-xs"
                >
                  {isTestingConnection ? "测试中..." : "测试链接"}
                </Button>

                {testMessage && (
                  <p className={`text-xs text-center ${testSuccess ? "text-green-600" : "text-red-500"}`}>
                    {testMessage}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <DialogClose asChild>
                  <Button variant="outline" className="h-10 flex-1 rounded-full">
                    关闭
                  </Button>
                </DialogClose>
                <Button onClick={handleSaveKey} className="h-10 flex-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium shadow-md active:scale-95 transition-transform">
                  保存配置
                </Button>
              </div>
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
