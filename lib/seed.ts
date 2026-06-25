import { db } from "./db";
import type {
  AppConfig,
  Phase,
  Subject,
  DailyTask,
  ScheduleItem,
  Milestone,
  EmergencyPlan,
} from "./plan-schema";

// Next.js typed JSON import
import defaultPlanData from "@/data/default-plan.json";

interface DefaultPlan {
  config: Omit<AppConfig, "key">;
  phases: Phase[];
  subjects: Subject[];
  dailySchedule: { items: ScheduleItem[] };
  milestones: Milestone[];
  emergencyPlans: EmergencyPlan[];
}

const plan = defaultPlanData as unknown as DefaultPlan;

export async function seedIfEmpty() {
  const existingConfig = await db.config.get("main");
  if (existingConfig) return; // already seeded

  // Insert config
  await db.config.put({ key: "main", ...plan.config });

  // Insert phases
  await db.phases.bulkPut(plan.phases);

  // Insert subjects
  await db.subjects.bulkPut(plan.subjects);

  // Insert daily schedule
  await db.dailySchedule.put({
    key: "main",
    items: plan.dailySchedule.items,
  });

  // Insert milestones
  await db.milestones.bulkPut(plan.milestones);

  // Insert emergency plans
  await db.emergencyPlans.bulkPut(plan.emergencyPlans);

  // Insert default AI config
  await db.aiConfig.put({
    key: "main",
    personality: "balanced",
    proactivity: "normal",
    nickname: "考研人",
  });

  // Generate daily tasks for today
  await generateTodayTasks();
}

export async function generateTodayTasks(dateStr?: string) {
  const today = dateStr || new Date().toISOString().split("T")[0];
  const config = await db.config.get("main");
  if (!config) return;

  // Check if tasks already exist for today
  const existing = await db.dailyTasks.where("date").equals(today).count();
  if (existing > 0) return;

  const phases = await db.phases.orderBy("order").toArray();
  const subjects = await db.subjects.toArray();

  // Find current phase
  const currentPhase = phases.find(
    (p) => today >= p.startDate && today <= p.endDate
  );
  if (!currentPhase) return;

  // Generate tasks from subjects' current phase plans
  const tasks: DailyTask[] = [];
  for (const subject of subjects) {
    const phasePlan = subject.phases.find(
      (pp) => pp.phaseId === currentPhase.id
    );
    if (!phasePlan || phasePlan.tasks.length === 0) continue;

    const tasksPerSubject = Math.min(4, phasePlan.tasks.length);
    for (let i = 0; i < tasksPerSubject; i++) {
      tasks.push({
        id: `${today}-${subject.id}-${i}`,
        date: today,
        subjectId: subject.id,
        title: phasePlan.tasks[i],
        estimatedMinutes: Math.round(
          (phasePlan.dailyHours * 60) / tasksPerSubject
        ),
        actualMinutes: 0,
        completed: false,
      });
    }
  }
  // Add weekly review task on Sundays
  const dateObj = new Date(today + "T00:00:00");
  if (dateObj.getDay() === 0) {
    tasks.push({
      id: `${today}-review-weekly`,
      date: today,
      subjectId: "review",
      title: "📝 每周复盘 — 回答5个问题，回顾本周成长",
      estimatedMinutes: 20,
      actualMinutes: 0,
      completed: false,
    });
  }

  if (tasks.length > 0) {
    await db.dailyTasks.bulkPut(tasks);
  }
}

export async function ensureTodayCheckIn() {
  const today = new Date().toISOString().split("T")[0];
  const existing = await db.checkIns.get(today);
  if (existing) return;

  const tasks = await db.dailyTasks.where("date").equals(today).toArray();
  const completed = tasks.filter((t) => t.completed).length;
  const pomodoros = await db.pomodoroSessions
    .where("date")
    .equals(today)
    .toArray();
  const totalMinutes = pomodoros.reduce((s, p) => s + p.duration, 0);

  await db.checkIns.put({
    date: today,
    score: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
    totalMinutes,
    tasksCompleted: completed,
    tasksTotal: tasks.length,
    mood: 3 as const,
    note: "",
    didMinimum: totalMinutes >= 10,
  });
}
