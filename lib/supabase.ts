// Supabase cloud sync — 零配置云端同步
// 实际逻辑在 supabase-service.ts，这里保留 re-export 兼容

export { uploadToCloud, downloadFromCloud } from "./supabase-service";
export type { SyncPayload, SyncResult } from "./supabase-service";
