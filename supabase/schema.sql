-- 考研搭子 Supabase 数据库 Schema

-- 用户配置
CREATE TABLE user_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  target_school TEXT NOT NULL DEFAULT '南京大学',
  target_major TEXT NOT NULL DEFAULT '人工智能专业',
  target_score_total INTEGER NOT NULL DEFAULT 390,
  target_score_politics INTEGER NOT NULL DEFAULT 70,
  target_score_english INTEGER NOT NULL DEFAULT 75,
  target_score_math INTEGER NOT NULL DEFAULT 130,
  target_score_cs408 INTEGER NOT NULL DEFAULT 115,
  start_date DATE NOT NULL DEFAULT '2026-06-23',
  exam_date DATE NOT NULL DEFAULT '2026-12-19',
  total_days INTEGER NOT NULL DEFAULT 180,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 备考阶段
CREATE TABLE phases (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  weeks INTEGER NOT NULL,
  core_task TEXT NOT NULL,
  intensity INTEGER NOT NULL DEFAULT 60
);

-- 科目
CREATE TABLE subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  target_score INTEGER NOT NULL,
  weight INTEGER NOT NULL
);

-- 科目-阶段计划
CREATE TABLE subject_phase_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
  phase_id TEXT REFERENCES phases(id) ON DELETE CASCADE,
  tasks JSONB NOT NULL DEFAULT '[]',
  resources JSONB NOT NULL DEFAULT '[]',
  daily_hours REAL NOT NULL DEFAULT 0
);

-- 每日任务
CREATE TABLE daily_tasks (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL,
  subject_id TEXT NOT NULL,
  title TEXT NOT NULL,
  estimated_minutes INTEGER NOT NULL DEFAULT 30,
  actual_minutes INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ
);

-- 打卡记录
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL UNIQUE,
  score INTEGER NOT NULL DEFAULT 0,
  total_minutes INTEGER NOT NULL DEFAULT 0,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  tasks_total INTEGER NOT NULL DEFAULT 0,
  mood INTEGER NOT NULL DEFAULT 3 CHECK (mood BETWEEN 1 AND 5),
  note TEXT NOT NULL DEFAULT '',
  did_minimum BOOLEAN NOT NULL DEFAULT false
);

-- 番茄钟记录
CREATE TABLE pomodoro_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL,
  subject_id TEXT NOT NULL,
  task_id TEXT,
  duration INTEGER NOT NULL,
  target_duration INTEGER NOT NULL DEFAULT 25,
  completed BOOLEAN NOT NULL DEFAULT true,
  interrupted BOOLEAN NOT NULL DEFAULT false
);

-- AI 搭子配置
CREATE TABLE ai_config (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  personality TEXT NOT NULL DEFAULT 'balanced' CHECK (personality IN ('strict','gentle','balanced','custom')),
  custom_prompt TEXT,
  proactivity TEXT NOT NULL DEFAULT 'normal' CHECK (proactivity IN ('high','normal','low')),
  nickname TEXT NOT NULL DEFAULT '考研人'
);

-- AI 聊天消息
CREATE TABLE ai_messages (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  timestamp BIGINT NOT NULL
);

-- 每日作息模板
CREATE TABLE daily_schedule (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  items JSONB NOT NULL DEFAULT '[]'
);

-- 里程碑
CREATE TABLE milestones (
  id TEXT PRIMARY KEY,
  phase_id TEXT REFERENCES phases(id),
  month TEXT NOT NULL,
  title TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  reward TEXT NOT NULL DEFAULT ''
);

-- 里程碑完成进度
CREATE TABLE milestone_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  milestone_id TEXT REFERENCES milestones(id) ON DELETE CASCADE,
  completed_items JSONB NOT NULL DEFAULT '[]'
);

-- 应急预案
CREATE TABLE emergency_plans (
  id TEXT PRIMARY KEY,
  scenario TEXT NOT NULL,
  analysis TEXT NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]'
);

-- 索引
CREATE INDEX idx_daily_tasks_user_date ON daily_tasks(user_id, date);
CREATE INDEX idx_check_ins_user_date ON check_ins(user_id, date);
CREATE INDEX idx_pomodoro_sessions_user_date ON pomodoro_sessions(user_id, date);
CREATE INDEX idx_ai_messages_user ON ai_messages(user_id, timestamp);

-- RLS 策略（每用户只看自己的数据）
ALTER TABLE user_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_progress ENABLE ROW LEVEL SECURITY;

-- 公共读表（所有人共享）
ALTER TABLE phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_phase_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_plans ENABLE ROW LEVEL SECURITY;

-- RLS: 用户只能操作自己的数据
CREATE POLICY "Users own data" ON user_config FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own tasks" ON daily_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own checkins" ON check_ins FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own pomodoros" ON pomodoro_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own ai config" ON ai_config FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own ai messages" ON ai_messages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own schedule" ON daily_schedule FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own progress" ON milestone_progress FOR ALL USING (auth.uid() = user_id);

-- 公共表：所有人可读
CREATE POLICY "Public read phases" ON phases FOR SELECT USING (true);
CREATE POLICY "Public read subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Public read subject_plans" ON subject_phase_plans FOR SELECT USING (true);
CREATE POLICY "Public read milestones" ON milestones FOR SELECT USING (true);
CREATE POLICY "Public read emergency" ON emergency_plans FOR SELECT USING (true);
