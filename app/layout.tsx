import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "双点博物馆探险困境指南 | 悦小白游戏记",
  description: "双点博物馆探险困境选择与结果查询系统，生存指南及数据汇总。",
  applicationName: "Two Point Museum Expedition Guide",
  authors: [{ name: "悦小白" }],
  // 1. 新增：关联你创建的 manifest.json 文件
  manifest: "/manifest.json", 
  // 2. 新增：针对 iOS 的专用配置
  appleWebApp: {
    capable: true,               // 允许全屏显示（隐藏 Safari 地址栏）
    statusBarStyle: "default",   // 状态栏样式（电量、时间显示区域）
    title: "探险指南",            // 在桌面上显示的 App 名称
  },
  // 3. 建议：设置主题颜色，会让 App 的启动顶栏颜色更统一
  themeColor: "#ea580c", 
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 antialiased`}>
        {/* 页面主容器：限制最大宽度并居中，增加侧边距防止移动端贴边 */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </main>
        
        {/* 这里可以放置全局统一的背景装饰、或者全局性的统计脚本 */}
      </body>
    </html>
  );
}

