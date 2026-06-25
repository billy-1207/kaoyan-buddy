import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export interface UserConfigRow {
  id?: string;
  user_id: string;
  target_school: string;
  target_major: string;
  target_score_total: number;
  target_score_politics: number;
  target_score_english: number;
  target_score_math: number;
  target_score_cs408: number;
  start_date: string;
  exam_date: string;
  total_days: number;
}

export interface DailyTaskRow {
  id: string;
  user_id: string;
  date: string;
  subject_id: string;
  title: string;
  estimated_minutes: number;
  actual_minutes: number;
  completed: boolean;
  completed_at?: string;
}

export interface CheckInRow {
  id?: string;
  user_id: string;
  date: string;
  score: number;
  total_minutes: number;
  tasks_completed: number;
  tasks_total: number;
  mood: number;
  note: string;
  did_minimum: boolean;
}

export interface PomodoroSessionRow {
  id: string;
  user_id: string;
  date: string;
  subject_id: string;
  task_id?: string;
  duration: number;
  target_duration: number;
  completed: boolean;
  interrupted: boolean;
}

export interface AIConfigRow {
  user_id: string;
  personality: "strict" | "gentle" | "balanced" | "custom";
  custom_prompt?: string;
  proactivity: "high" | "normal" | "low";
  nickname: string;
}

export interface AIMessageRow {
  id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}
