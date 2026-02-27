import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate, useLocation } from "react-router";
import { ChevronLeft, Download, Copy, Check, Home } from "lucide-react";
import { Button } from "../components/ui/button";

export default function ActionBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const { title, content, coverImage } = location.state || {};

  const handleCopy = async () => {
    const textToCopy = `${title}\n\n${content}`;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleNewContent = () => {
    navigate("/input");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-full flex flex-col relative bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white/50 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/canvas")}
          className="rounded-full"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h2 className="text-xl font-semibold text-gray-800">导出内容</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleGoHome}
          className="rounded-full"
        >
          <Home className="w-5 h-5" />
        </Button>
      </div>

      <div className="px-6 py-8">
        {/* Success Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mb-6 shadow-2xl"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1
            }}
          >
            <Check className="w-12 h-12 text-white" />
          </motion.div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            内容生成完成！
          </h3>
          <p className="text-gray-600">
            现在可以导出你的作品了
          </p>
        </motion.div>

        {/* Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl mb-8"
        >
          <div className="flex gap-4 mb-4">
            {coverImage && (
              <img 
                src={coverImage} 
                alt="Cover" 
                className="w-24 h-32 object-cover rounded-2xl"
              />
            )}
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {title}
              </h4>
              <p className="text-sm text-gray-600 line-clamp-3">
                {content}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <Button
            onClick={handleSave}
            className="w-full h-16 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-lg shadow-xl relative overflow-hidden"
          >
            {saved ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2"
              >
                <Check className="w-5 h-5" />
                已保存到相册
              </motion.div>
            ) : (
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                保存到相册
              </div>
            )}
          </Button>

          <Button
            onClick={handleCopy}
            variant="outline"
            className="w-full h-16 rounded-2xl text-lg bg-white/80 backdrop-blur-sm border-2 hover:bg-white relative overflow-hidden"
          >
            {copied ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 text-green-600"
              >
                <Check className="w-5 h-5" />
                已复制全文
              </motion.div>
            ) : (
              <div className="flex items-center gap-2">
                <Copy className="w-5 h-5" />
                复制全文
              </div>
            )}
          </Button>
        </motion.div>

        {/* Create New */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600 mb-4">想创作更多内容？</p>
          <Button
            onClick={handleNewContent}
            variant="ghost"
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
          >
            创建新内容
          </Button>
        </motion.div>
      </div>

      {/* Confetti-like particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 15 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `hsl(${Math.random() * 60 + 140}, 70%, 60%)`
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    </div>
  );
}
