-- 考研搭子 云端同步 Schema
-- 单表设计：一个 sync_code 对应一份完整数据快照
-- 使用方式：在 Supabase SQL Editor 中执行此文件

CREATE TABLE IF NOT EXISTS sync_data (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sync_code TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_data_code ON sync_data(sync_code);

-- 开启 RLS
ALTER TABLE sync_data ENABLE ROW LEVEL SECURITY;

-- 允许匿名访问（Anon Key 已嵌入 App，个人使用安全可控）
CREATE POLICY "anon_access" ON sync_data
  FOR ALL
  USING (true)
  WITH CHECK (true);
