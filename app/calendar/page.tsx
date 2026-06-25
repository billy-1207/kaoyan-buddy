"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/db";
import { useStreak } from "@/hooks/useStreak";
import type { CheckIn } from "@/lib/plan-schema";

function getColor(minutes: number): string {
  if (minutes === 0) return "bg-gray-100";
  if (minutes <= 60) return "bg-green-200";
  if (minutes <= 180) return "bg-green-400";
  if (minutes <= 360) return "bg-green-600";
  return "bg-green-800";
}

const moodEmojis: Record<number, string> = { 1: "😞", 2: "😐", 3: "🙂", 4: "😊", 5: "🤩" };

export default function CalendarPage() {
  const [data, setData] = useState<Record<string, number>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayDetail, setDayDetail] = useState<CheckIn | null>(null);
  const { currentStreak, longestStreak, totalMinutes } = useStreak();

  useEffect(() => {
    (async () => {
      const checkIns = await db.checkIns.toArray();
      const map: Record<string, number> = {};
      checkIns.forEach((ci) => { map[ci.date] = ci.totalMinutes; });
      setData(map);
    })();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      db.checkIns.get(selectedDate).then((ci) => setDayDetail(ci || null));
    }
  }, [selectedDate]);

  // Generate 180-day grid
  const today = new Date();
  const weeks: { date: string; day: number }[][] = [];
  let currentWeek: { date: string; day: number }[] = [];
  for (let i = 179; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    currentWeek.push({ date: dateStr, day: d.getDay() });
    if (d.getDay() === 6 || i === 0) { weeks.push(currentWeek); currentWeek = []; }
  }

  const dayLabels = ["日", "一", "二", "三", "四", "五", "六"];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-primary">📅 打卡日历</h1>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "当前连续", value: currentStreak, color: "text-warn" },
          { label: "最长连续", value: longestStreak, color: "text-primary" },
          { label: "总学习小时", value: Math.round(totalMinutes / 60), color: "text-success" },
        ].map((c, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-mid text-center">
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-muted">{c.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-mid overflow-x-auto">
        <h2 className="font-bold text-primary mb-4">学习热力图</h2>
        <div className="flex gap-1">
          <div className="flex flex-col gap-1 mr-2 pt-5">
            {dayLabels.map((l, i) => (
              <span key={i} className="text-xs text-muted h-4 leading-4">{i % 2 === 0 ? l : ""}</span>
            ))}
          </div>
          <div className="flex gap-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {wi === 0 || new Date(week[0]?.date).getMonth() !== new Date(weeks[wi - 1]?.[0]?.date).getMonth() ? (
                  <span className="text-xs text-muted h-5 leading-5">
                    {week[0] && new Date(week[0].date).toLocaleDateString("zh-CN", { month: "short" })}
                  </span>
                ) : <div className="h-5" />}
                {Array.from({ length: 7 }).map((_, di) => {
                  const cell = week.find((c) => c.day === di);
                  if (!cell) return <div key={di} className="w-4 h-4" />;
                  const minutes = data[cell.date] || 0;
                  return (
                    <button
                      key={cell.date}
                      onClick={() => setSelectedDate(cell.date)}
                      className={`w-4 h-4 rounded-sm ${getColor(minutes)} ${
                        selectedDate === cell.date ? "ring-2 ring-primary ring-offset-1" : ""
                      } hover:ring-2 hover:ring-primary/50 transition-all`}
                      title={`${cell.date}: ${minutes}分钟`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 mt-4 text-xs text-muted">
          <span>少</span>
          {["bg-gray-100", "bg-green-200", "bg-green-400", "bg-green-600", "bg-green-800"].map((c) => (
            <div key={c} className={`w-4 h-4 rounded-sm ${c}`} />
          ))}
          <span>多</span>
        </div>
      </div>
      {selectedDate && dayDetail && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-mid">
          <h3 className="font-bold text-primary mb-3">📅 {selectedDate} 学习详情</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-muted">学习时长</p><p className="font-bold">{dayDetail.totalMinutes} 分钟</p></div>
            <div><p className="text-muted">任务完成</p><p className="font-bold">{dayDetail.tasksCompleted}/{dayDetail.tasksTotal}</p></div>
            <div><p className="text-muted">完成度</p><p className="font-bold">{dayDetail.score}%</p></div>
            <div><p className="text-muted">心情</p><p className="font-bold">{moodEmojis[dayDetail.mood] || "🙂"}</p></div>
          </div>
          {dayDetail.note && (
            <div className="mt-3 pt-3 border-t border-mid">
              <p className="text-xs text-muted mb-1">📝 复盘笔记</p>
              <p className="text-sm">{dayDetail.note}</p>
            </div>
          )}
        </div>
      )}
      {selectedDate && !dayDetail && (
        <p className="text-sm text-muted text-center">{selectedDate} — 这天没有学习记录</p>
      )}
    </div>
  );
}
