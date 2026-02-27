import { RouterProvider } from "react-router";
import { router } from "./routes";

export default function App() {
  return (
    // 桌面端：居中容器；移动端：全屏
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center md:p-8">
      {/* 限制最大容器宽度适配 iOS 移动端比例，但移除手机壳伪装样式 */}
      <div
        className="
          relative w-full h-screen
          md:w-[390px] md:h-[844px]
          md:shadow-2xl
          overflow-hidden
        "
        style={{ maxHeight: "100svh" }}
      >
        {/* 内容区 */}
        <div className="w-full h-full overflow-y-auto overflow-x-hidden scrollbar-none"
          style={{ scrollbarWidth: "none" }}
        >
          <RouterProvider router={router} />
        </div>
      </div>
    </div>
  );
}
