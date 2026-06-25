"use client";
import { useEffect, useState } from "react";
import { usePomodoro } from "@/hooks/usePomodoro";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";

const subjectLabels: Record<string, string> = {
  math: "数学一", cs408: "408综合", english: "英语一", politics: "政治",
};

export default function PomodoroPage() {
  const pom = usePomodoro();
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [weekCount, setWeekCount] = useState(0);

  useEffect(() => {
    db.subjects.toArray().then((s) => setSubjects(s.map((x) => ({ id: x.id, name: x.name }))));
  }, []);

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().split("T")[0];
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split("T")[0];
      const all = await db.pomodoroSessions.toArray();
      setTodayCount(all.filter((s) => s.date === today && s.completed).length);
      setWeekCount(all.filter((s) => s.date >= weekAgoStr && s.completed).length);
    })();
  }, [pom.state]);

  const mins = Math.floor(pom.secondsLeft / 60);
  const secs = pom.secondsLeft % 60;
  const isActive = pom.state === "focusing" || pom.state === "resting";
  const isFocusing = pom.state === "focusing";

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-primary">🍅 番茄钟</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-mid">
          <div className="flex flex-col items-center py-4">
            <div
              className={`w-48 h-48 md:w-56 md:h-56 rounded-full flex items-center justify-center border-8 transition-colors ${
                isActive
                  ? isFocusing ? "border-warn bg-warn/5" : "border-success bg-success/5"
                  : "border-mid bg-light"
              }`}
            >
              <div className="text-center">
                <p className="text-5xl md:text-6xl font-bold text-text tabular-nums">
                  {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                </p>
                <p className="text-sm text-muted mt-2">
                  {pom.state === "focusing" ? "🍅 专注中" : pom.state === "resting" ? "☕ 休息中" : pom.state === "paused" ? "⏸ 已暂停" : "准备开始"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2 flex-wrap justify-center">
              {subjects.map((s) => (
                <button
                  key={s.id}
                  disabled={!["idle"].includes(pom.state)}
                  onClick={() => pom.setSelectedSubject(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    pom.selectedSubject === s.id ? "bg-primary text-white" : "bg-white text-text border border-mid"
                  } ${!["idle"].includes(pom.state) ? "opacity-50 cursor-not-allowed" : "hover:bg-light"}`}
                >
                  {subjectLabels[s.id] || s.name}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              {pom.state === "idle" && (
                <Button onClick={() => pom.start("focusing")} className="bg-warn hover:bg-warn/90 text-white px-8">
                  🍅 开始专注
                </Button>
              )}
              {isActive && (
                <>
                  <Button onClick={pom.pause} variant="outline">⏸ 暂停</Button>
                  <Button onClick={pom.stop} variant="outline">⏹ 停止</Button>
                </>
              )}
              {pom.state === "paused" && (
                <>
                  <Button onClick={pom.resume} className="bg-success hover:bg-success/90 text-white">▶ 继续</Button>
                  <Button onClick={pom.stop} variant="outline">⏹ 结束</Button>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-mid">
          <h3 className="font-bold text-primary mb-4">📊 番茄统计</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-success">{todayCount}</p>
              <p className="text-xs text-muted">今日番茄</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{weekCount}</p>
              <p className="text-xs text-muted">本周番茄</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
