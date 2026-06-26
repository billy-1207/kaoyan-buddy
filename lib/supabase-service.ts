import { createClient } from "@supabase/supabase-js";

// ── Supabase 配置（零用户配置，硬编码）──
const SUPABASE_URL = "https://hbapgiiedyzlkldjpldx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_q3Q2M_drkL87k393VQIV-A_9wQfHxVp";

// ── 类型 ──

export interface SyncPayload {
  config: unknown;
  phases: unknown[];
  subjects: unknown[];
  dailyTasks: unknown[];
  checkIns: unknown[];
  pomodoroSessions: unknown[];
  aiConfig: unknown;
  aiMessages: unknown[];
  dailySchedule: unknown;
  milestones: unknown[];
  emergencyPlans: unknown[];
  milestoneProgress: unknown[];
}

export interface SyncResult {
  ok: boolean;
  message: string;
  time?: string;
}

// ── 工具函数 ──

function getSyncCode(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("sync_code") || "";
}

// ── 上传到云端 ──

export async function uploadToCloud(data: SyncPayload): Promise<SyncResult> {
  const syncCode = getSyncCode();
  if (!syncCode) {
    return { ok: false, message: "请先设置同步码" };
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { error } = await supabase.from("sync_data").upsert(
      {
        sync_code: syncCode,
        data: data as unknown as Record<string, unknown>,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "sync_code" }
    );

    if (error) throw error;

    return { ok: true, message: "上传成功", time: new Date().toISOString() };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "未知错误";
    return { ok: false, message: `上传失败: ${msg}` };
  }
}

// ── 从云端下载 ──

export async function downloadFromCloud(): Promise<
  SyncResult & { data?: SyncPayload }
> {
  const syncCode = getSyncCode();
  if (!syncCode) {
    return { ok: false, message: "请先设置同步码" };
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data: row, error } = await supabase
      .from("sync_data")
      .select("data, updated_at")
      .eq("sync_code", syncCode)
      .maybeSingle();

    if (error) throw error;
    if (!row) {
      return { ok: false, message: "云端暂无数据，请先在另一台设备上传" };
    }

    return {
      ok: true,
      message: "下载成功",
      time: row.updated_at as string,
      data: row.data as SyncPayload,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "未知错误";
    return { ok: false, message: `下载失败: ${msg}` };
  }
}
