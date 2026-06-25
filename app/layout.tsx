import type { Metadata } from "next";
import { AppConfigProvider } from "@/lib/contexts/AppContext";
import { TodayProvider } from "@/lib/contexts/TodayContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { FloatingBuddy } from "@/components/ai-buddy/FloatingBuddy";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: "考研搭子 - 11408 备考助手",
  description: "AI 考研搭子 + 全科备考管理 App",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <TooltipProvider>
          <AppConfigProvider>
            <TodayProvider>
              <MainLayout>{children}</MainLayout>
              <FloatingBuddy />
            </TodayProvider>
          </AppConfigProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
