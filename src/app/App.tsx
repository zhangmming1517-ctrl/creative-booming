import { RouterProvider } from "react-router";
import { router } from "./routes";

export default function App() {
  return (
    // 桌面端容器 + 移动端自适应
    <div className="min-h-screen bg-black flex items-center justify-center md:p-8">
      {/* 限制容器在移动端表现为 native app 感觉，增加对 safe-area 的感知 */}
      <div
        className="
          relative w-full h-full
          md:w-[390px] md:h-[844px]
          md:rounded-[40px] md:shadow-2xl
          overflow-hidden
          bg-white
        "
        style={{ height: "100svh" }}
      >
        {/* 内容区，处理 iOS Notch 部分的间隙 */}
        <div className="w-full h-full overflow-y-auto overflow-x-hidden scrollbar-none 
          pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
          style={{ 
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch" // 添加原生滚动手感
          }}
        >
          <RouterProvider router={router} />
        </div>
      </div>
    </div>
  );
}
