import { RouterProvider } from "react-router";
import { router } from "./routes";

export default function App() {
  return (
    // 桌面端容器 + 移动端自适应
    <div className="min-h-screen bg-black flex items-center justify-center md:p-8">
      {/* 内容全屏化，移除多余背景，让具体页面背景填满刘海区域 */}
      <div
        className="
          relative w-full h-full
          md:w-[390px] md:h-[844px]
          md:rounded-[40px] md:shadow-2xl
          overflow-hidden
        "
        style={{ height: "100dvh" }}
      >
        <div className="w-full h-full overflow-y-auto overflow-x-hidden scrollbar-none"
          style={{ 
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch"
          }}
        >
          <RouterProvider router={router} />
        </div>
      </div>
    </div>
  );
}
