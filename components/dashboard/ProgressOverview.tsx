"use client";
import { useProgress } from "@/hooks/useProgress";

const subjectColors: Record<string, string> = {
  math: "bg-orange-500",
  cs408: "bg-emerald-500",
  english: "bg-amber-500",
  politics: "bg-purple-500",
};

export function ProgressOverview() {
  const { subjectProgress, phaseProgress } = useProgress();

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-mid">
      <h2 className="font-bold text-lg text-primary mb-4">📊 进度总览</h2>
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted">当前阶段进度</span>
          <span className="font-medium">{phaseProgress}%</span>
        </div>
        <div className="w-full bg-light rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${phaseProgress}%` }}
          />
        </div>
      </div>
      <div className="space-y-3">
        {subjectProgress.map((s) => (
          <div key={s.id}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-text">{s.name}</span>
              <span className="font-medium">{s.percent}%</span>
            </div>
            <div className="w-full bg-light rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${subjectColors[s.id] || "bg-primary"}`}
                style={{ width: `${Math.min(s.percent, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
