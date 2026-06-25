import Dexie, { type Table } from "dexie";
import type {
  AppConfig,
  Phase,
  Subject,
  DailyTask,
  CheckIn,
  PomodoroSession,
  AIBuddyConfig,
  AIMessage,
  DailySchedule,
  Milestone,
  EmergencyPlan,
  MilestoneProgress,
} from "./plan-schema";

export class KaoyanBuddyDB extends Dexie {
  config!: Table<AppConfig, string>;
  phases!: Table<Phase, string>;
  subjects!: Table<Subject, string>;
  dailyTasks!: Table<DailyTask, string>;
  checkIns!: Table<CheckIn, string>;
  pomodoroSessions!: Table<PomodoroSession, string>;
  aiConfig!: Table<AIBuddyConfig, string>;
  aiMessages!: Table<AIMessage, string>;
  dailySchedule!: Table<DailySchedule, string>;
  milestones!: Table<Milestone, string>;
  emergencyPlans!: Table<EmergencyPlan, string>;
  milestoneProgress!: Table<MilestoneProgress, string>;

  constructor() {
    super("kaoyanBuddyDB");
    this.version(1).stores({
      config: "key",
      phases: "id",
      subjects: "id",
      dailyTasks: "id, date, subjectId, completed",
      checkIns: "date",
      pomodoroSessions: "id, date, subjectId",
      aiConfig: "key",
      aiMessages: "id, timestamp",
      dailySchedule: "key",
      milestones: "id, phaseId",
      emergencyPlans: "id",
      milestoneProgress: "milestoneId",
    });
  }
}

export const db = new KaoyanBuddyDB();
