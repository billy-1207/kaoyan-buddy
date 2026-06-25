"use client";
import Link from "next/link";
import { useAppConfig } from "@/lib/contexts/AppContext";
import { useStreak } from "@/hooks/useStreak";

export function BuddyGreeting() {
  const { config } = useAppConfig();
  const { currentStreak } = useStreak();

  if (!config) return null;

  const msg =
    currentStreak === 0
      ? "早上好！今天开始你的考研之旅吧 🌱"
      : currentStreak >= 7
      ? `连续 ${currentStreak} 天打卡！你太厉害了，继续保持 💪`
      : `坚持 ${currentStreak} 天了，今天也一起加油吧 ✨`;

  return (
    <Link href="/ai-buddy">
      <div className="bg-gradient-to-r from-primary to-primary-light rounded-xl p-5 shadow-sm text-white cursor-pointer hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🤖</span>
          <div>
            <p className="font-medium">搭子说：{msg}</p>
            <p className="text-sm text-white/70 mt-1">点击和我聊天 →</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
