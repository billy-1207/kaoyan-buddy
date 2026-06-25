"use client";
import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import type { DailyTask, Subject } from "@/lib/plan-schema";
import { useToday } from "@/lib/contexts/TodayContext";

const subjects = [
  { id: "math", label: "数学一", icon: "📐" },
  { id: "cs408", label: "408综合", icon: "💻" },
  { id: "english", label: "英语一", icon: "📖" },
  { id: "politics", label: "政治", icon: "📰" },
];

export default function TasksPage() {
  const [activeSubject, setActiveSubject] = useState("math");
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const { refreshTasks: refreshToday } = useToday();

  const load = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    setLoading(true);
    const t = await db.dailyTasks
      .where("date")
      .equals(today)
      .and((task) => task.subjectId === activeSubject)
      .toArray();
    setTasks(t);
    const s = await db.subjects.get(activeSubject);
    setSubject(s || null);
    setLoading(false);
  }, [activeSubject]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleTask = async (task: DailyTask) => {
    await db.dailyTasks.update(task.id, {
      completed: !task.completed,
      completedAt: !task.completed ? new Date().toISOString() : undefined,
    });
    load();
    refreshToday();
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-primary">📋 任务中心</h1>
      <div className="flex gap-2 flex-wrap">
        {subjects.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSubject(s.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeSubject === s.id
                ? "bg-primary text-white"
                : "bg-white text-text border border-mid hover:bg-light"
            )}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>
      {subject && (
        <div className="mb-2">
          <p className="text-sm text-muted">
            目标 {subject.targetScore} 分 · 时间占比 {subject.weight}%
          </p>
          <div className="w-full bg-light rounded-full h-1.5 mt-2">
            <div
              className="bg-primary h-1.5 rounded-full transition-all"
              style={{
                width: `${tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}%`,
              }}
            />
          </div>
        </div>
      )}
      {loading ? (
        <p className="text-muted text-sm py-8 text-center">加载中...</p>
      ) : tasks.length === 0 ? (
        <p className="text-muted text-sm py-8 text-center">今天该科目暂无任务</p>
      ) : (
        <div className="space-y-1">
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => toggleTask(task)}
              className="flex items-center gap-3 w-full text-left p-3 rounded-lg hover:bg-light transition-colors bg-white border border-mid/50"
            >
              <span
                className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs flex-shrink-0 transition-colors",
                  task.completed
                    ? "bg-success border-success text-white"
                    : "border-mid"
                )}
              >
                {task.completed ? "✓" : ""}
              </span>
              <div className="flex-1 min-w-0">
                <span className={cn("text-sm", task.completed && "line-through text-muted")}>
                  {task.title}
                </span>
              </div>
              <span className="text-xs text-muted">{task.estimatedMinutes}min</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
