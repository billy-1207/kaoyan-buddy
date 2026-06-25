"use client";
import { useToday } from "@/lib/contexts/TodayContext";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

const subjectLabels: Record<string, string> = {
  math: "数学一",
  cs408: "408综合",
  english: "英语一",
  politics: "政治",
};

export function TodayTasksPreview() {
  const { tasks, loading, refreshTasks } = useToday();

  const toggleTask = async (taskId: string, current: boolean) => {
    await db.dailyTasks.update(taskId, {
      completed: !current,
      completedAt: !current ? new Date().toISOString() : undefined,
    });
    refreshTasks();
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-mid">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg text-primary">📋 今日待办</h2>
        <span className="text-sm text-muted">
          {completedCount}/{tasks.length} 已完成
        </span>
      </div>
      {loading ? (
        <p className="text-muted text-sm">加载中...</p>
      ) : tasks.length === 0 ? (
        <p className="text-muted text-sm">今天还没有任务，去设置导入计划吧</p>
      ) : (
        <div className="space-y-2">
          {tasks.slice(0, 8).map((task) => (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id, task.completed)}
              className="flex items-center gap-3 w-full text-left p-2 rounded-lg hover:bg-light transition-colors"
            >
              <span
                className={cn(
                  "w-5 h-5 rounded border-2 flex items-center justify-center text-xs flex-shrink-0 transition-colors",
                  task.completed
                    ? "bg-success border-success text-white"
                    : "border-mid"
                )}
              >
                {task.completed ? "✓" : ""}
              </span>
              <span
                className={cn(
                  "text-sm flex-1",
                  task.completed && "line-through text-muted"
                )}
              >
                {task.title}
              </span>
              <span className="text-xs text-muted">
                {subjectLabels[task.subjectId] || task.subjectId}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
