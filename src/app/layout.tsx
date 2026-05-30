import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RepoRoast - AI 开源项目毒舌评审官",
  description:
    "粘贴 GitHub 仓库链接，10 秒获得一份毒舌但专业的项目评审报告。",
  openGraph: {
    title: "RepoRoast - AI 开源项目毒舌评审官",
    description:
      "粘贴 GitHub 仓库链接，10 秒获得一份毒舌但专业的项目评审报告。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
