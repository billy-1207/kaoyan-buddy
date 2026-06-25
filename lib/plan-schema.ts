// ── 全局配置 ──
export interface TargetScore {
  total: number;
  politics: number;
  english: number;
  math: number;
  cs408: number;
}

export interface AppConfig {
  key: string;
  targetSchool: string;
  targetMajor: string;
  targetScore: TargetScore;
  startDate: string;
  examDate: string;
  totalDays: number;
}

// ── 阶段 ──
export interface Phase {
  id: string;
  name: string;
  order: number;
  startDate: string;
  endDate: string;
  weeks: number;
  coreTask: string;
  intensity: number;
}

// ── 科目 ──
export interface SubjectPhasePlan {
  phaseId: string;
  tasks: string[];
  resources: string[];
  dailyHours: number;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  targetScore: number;
  weight: number;
  phases: SubjectPhasePlan[];
}

// ── 每日任务实例 ──
export interface DailyTask {
  id: string;
  date: string;
  subjectId: string;
  title: string;
  estimatedMinutes: number;
  actualMinutes: number;
  completed: boolean;
  completedAt?: string;
}

// ── 打卡记录 ──
export type Mood = 1 | 2 | 3 | 4 | 5;

export interface CheckIn {
  date: string;
  score: number;
  totalMinutes: number;
  tasksCompleted: number;
  tasksTotal: number;
  mood: Mood;
  note: string;
  didMinimum: boolean;
}

// ── 番茄钟记录 ──
export interface PomodoroSession {
  id: string;
  date: string;
  subjectId: string;
  taskId?: string;
  duration: number;
  targetDuration: number;
  completed: boolean;
  interrupted: boolean;
}

// ── AI 搭子配置 ──
export type Personality = "strict" | "gentle" | "balanced" | "custom";
export type Proactivity = "high" | "normal" | "low";

export interface AIBuddyConfig {
  key: string;
  personality: Personality;
  customPrompt?: string;
  proactivity: Proactivity;
  nickname: string;
}

// ── AI 消息 ──
export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

// ── 每日作息 ──
export interface ScheduleItem {
  timeSlot: string;
  label: string;
  type: "study" | "rest" | "exercise" | "meal" | "free";
  durationMinutes: number;
  pinned: boolean;
}

export interface DailySchedule {
  key: string;
  items: ScheduleItem[];
}

// ── 月度里程碑 ──
export interface Milestone {
  id: string;
  phaseId: string;
  month: string;
  title: string;
  items: string[];
  reward: string;
}

// ── 应急预案 ──
export interface EmergencyStep {
  num: number;
  title: string;
  desc: string;
}

export interface EmergencyPlan {
  id: string;
  scenario: string;
  analysis: string;
  steps: EmergencyStep[];
}

// ── 里程碑进度 ──
export interface MilestoneProgress {
  milestoneId: string;
  completedItems: number[];
}
