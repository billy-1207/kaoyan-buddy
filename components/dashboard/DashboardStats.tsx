"use client";
import { useStreak } from "@/hooks/useStreak";
import { db } from "@/lib/db";
import { useState, useEffect } from "react";

export function DashboardStats() {
  const { currentStreak, longestStreak, totalMinutes } = useStreak();
  const [todayPomodoros, setTodayPomodoros] = useState(0);

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().split("T")[0];
      const sessions = await db.pomodoroSessions
        .where("date")
        .equals(today)
        .count();
      setTodayPomodoros(sessions);
    })();
  }, []);

  const cards = [
    { icon: "🔥", value: currentStreak, label: "连续打卡天数", color: "text-warn" },
    { icon: "🏆", value: longestStreak, label: "最长连续记录", color: "text-primary" },
    { icon: "🍅", value: todayPomodoros, label: "今日番茄数", color: "text-success" },
    { icon: "⏱️", value: Math.round(totalMinutes / 60), label: "总学习小时", color: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-white rounded-xl p-4 shadow-sm border border-mid text-center"
        >
          <p className="text-2xl mb-1">{card.icon}</p>
          <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          <p className="text-xs text-muted">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
