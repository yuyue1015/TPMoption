import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "双点博物馆档案库",
  description: "博物馆展品搜索系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}