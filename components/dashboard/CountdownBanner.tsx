"use client";
import { useAppConfig } from "@/lib/contexts/AppContext";

export function CountdownBanner() {
  const { config } = useAppConfig();
  if (!config) return null;

  const today = new Date();
  const start = new Date(config.startDate);
  const exam = new Date(config.examDate);
  const dayNumber = Math.floor(
    (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1
  );
  const daysLeft = Math.max(
    0,
    Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  );

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-mid">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">
            📅{" "}
            {today.toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </p>
          <p className="text-2xl font-bold text-primary mt-1">
            第 {dayNumber}/{config.totalDays} 天
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted">⏰ 距考试还有</p>
          <p
            className={`text-3xl font-bold ${
              daysLeft <= 30 ? "text-warn" : "text-primary"
            }`}
          >
            {daysLeft} 天
          </p>
        </div>
      </div>
    </div>
  );
}
