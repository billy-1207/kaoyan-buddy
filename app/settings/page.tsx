"use client";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { UpdateChecker } from "@/components/settings/UpdateChecker";
import { uploadToCloud, downloadFromCloud } from "@/lib/supabase-service";
import type { AIBuddyConfig } from "@/lib/plan-schema";

const tabs = [
  { id: "pouch", label: "🎒 锦囊" },
  { id: "review", label: "📝 每周复盘" },
  { id: "word", label: "📄 导入计划" },
  { id: "ai", label: "🎭 AI 搭子" },
  { id: "update", label: "🔄 检查更新" },
  { id: "data", label: "💾 数据管理" },
];

const pouches = [
  { icon: "⏱️", title: "今天只学 2 分钟", quote: "你不是不想学，你只是不想开始。", body: "万事开头难是骗人的。真正难的不是「做2小时数学」，而是「把屁股放到椅子上」。当你不想学的时候，和自己说：「我只学2分钟。2分钟后不想学了就停。」——几乎每次，一旦开始就不会停。", tag: "启动困难用这个" },
  { icon: "⛓️", title: "链不能断", quote: "连续性是习惯的氧气。", body: "今天状态再差，完成「最低版本」就行——做一道数学题、背50个单词、出门走一圈。一共40分钟。一天都不允许完全中断。因为断一次，「反正昨天也没学」的心态会让你断第二次、第三次。", tag: "状态差时用这个" },
  { icon: "☕", title: "把诱惑绑在学习上", quote: "利用你想做的事，驱动你该做的事。", body: "只有学习的时候才能喝你最爱的咖啡。只有完成上午任务后才能刷10分钟视频。把高频行为（刷手机）和低频行为（学习）绑定——你的大脑会主动想学。", tag: "缺动力时用这个" },
  { icon: "📅", title: "画一个满满的✓", quote: "看得见的进步，才是持续的动力。", body: "在墙上贴一张大日历，每完成一天就在那天画一个大大的✓。做一张「180天倒计时」进度条，每过一天涂一格。大脑对视觉化进度毫无抵抗力。", tag: "缺成就感时用这个" },
  { icon: "🍅", title: "种一棵番茄树", quote: "25分钟，只做一件事。", body: "把手机放另一个房间。设25分钟倒计时。任何「想查一下」的冲动写到便签纸上，番茄结束后再处理。每完成一个番茄就种一棵虚拟树——你的专注森林正在生长。", tag: "注意力涣散用这个" },
  { icon: "🎯", title: "你是自己的主人", quote: "自主、胜任、归属——三个需求满足，动机自然产生。", body: "自主感：每天的学习顺序你自己定。胜任感：每周末回顾一下「这周我学会了什么之前不会的」。归属感：找1-2个研友，每天互相打卡。独自学习最容易陷入「只有我最痛苦」的错觉。", tag: "迷茫时用这个" },
  { icon: "🌈", title: "让今天以「我能行」结束", quote: "好的结束 = 明天期待继续。", body: "诺贝尔奖得主发现：人们对一段经历的记忆，取决于「最强烈的时刻」和「最后时刻」。所以每天最后一个学习动作，做一道你会做的题。让今天在自信中结束，明天才想继续。", tag: "收尾时用这个" },
  { icon: "🤝", title: "找个不会辜负的人", quote: "恐惧驱动 = 焦虑。行为驱动 = 行动。", body: "找一个最信任的朋友，约定：今天没完成最低学习量就给他转200块钱。或者公开你的考研计划——「从今天起，每天打卡180天」。公开承诺后，你的大脑会自动让行为与承诺一致。", tag: "需要监督时用这个" },
];

const reviewQuestions = [
  "本周最大的收获是什么？",
  "本周遇到的最大困难是什么？怎么解决？",
  "哪些时间段效率最高？哪些最低？为什么？",
  "下周最重要的3个任务是什么？",
  "给自己的心态打分（1-10分），低于6分需要什么支持？",
];

const personalityOptions = [
  { value: "strict", label: "😤 严厉监督" },
  { value: "gentle", label: "🤗 温柔鼓励" },
  { value: "balanced", label: "⚖️ 平衡模式" },
  { value: "custom", label: "🎭 自定义" },
] as const;

const proactivityOptions = [
  { value: "high", label: "高频" },
  { value: "normal", label: "标准" },
  { value: "low", label: "低调" },
] as const;

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("pouch");
  const [aiConfig, setAiConfig] = useState<AIBuddyConfig | null>(null);
  const [aiSaved, setAiSaved] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [docxResult, setDocxResult] = useState<Record<string, unknown> | null>(null);
  const [docxLoading, setDocxLoading] = useState(false);
  const [docxError, setDocxError] = useState("");
  const [message, setMessage] = useState("");
  const [reviewAnswers, setReviewAnswers] = useState<Record<number, string>>({});
  const [reviewSaved, setReviewSaved] = useState(false);
  const [openPouch, setOpenPouch] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [cloudSyncing, setCloudSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    db.aiConfig.get("main").then((c) => setAiConfig(c || null));
  }, []);

  const saveAiConfig = async () => {
    if (!aiConfig) return;
    await db.aiConfig.put(aiConfig);
    setAiSaved(true);
    setTimeout(() => setAiSaved(false), 2000);
  };

  const handleDocxFile = async (file: File) => {
    if (!file.name.endsWith(".docx")) { setDocxError("请上传 .docx 格式的文件"); return; }
    setDocxLoading(true); setDocxError(""); setDocxResult(null);
    try {
      const formData = new FormData(); formData.append("file", file);
      const res = await fetch("/api/docx/parse", { method: "POST", body: formData });
      const data = await res.json();
      if (data.error) setDocxError(data.error); else setDocxResult(data.extracted);
    } catch { setDocxError("解析失败，请检查文件格式"); }
    finally { setDocxLoading(false); }
  };

  const handleExport = async () => {
    try {
      const data = {
        config: await db.config.get("main"), phases: await db.phases.toArray(),
        subjects: await db.subjects.toArray(), checkIns: await db.checkIns.toArray(),
        dailyTasks: await db.dailyTasks.toArray(), pomodoroSessions: await db.pomodoroSessions.toArray(),
        aiConfig: await db.aiConfig.get("main"), aiMessages: await db.aiMessages.toArray(),
        dailySchedule: await db.dailySchedule.get("main"),
        milestones: await db.milestones.toArray(), emergencyPlans: await db.emergencyPlans.toArray(),
        milestoneProgress: await db.milestoneProgress.toArray(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url;
      a.download = `kaoyan-buddy-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click(); URL.revokeObjectURL(url);
      setMessage("✅ 数据已导出");
    } catch { setMessage("❌ 导出失败"); }
    setTimeout(() => setMessage(""), 2000);
  };

  const handleImport = () => {
    const input = document.createElement("input"); input.type = "file"; input.accept = ".json";
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0]; if (!file) return;
      try {
        const text = await file.text(); const data = JSON.parse(text);
        if (data.config) await db.config.put(data.config);
        if (data.phases) await db.phases.bulkPut(data.phases);
        if (data.subjects) await db.subjects.bulkPut(data.subjects);
        if (data.checkIns) await db.checkIns.bulkPut(data.checkIns);
        if (data.dailyTasks) await db.dailyTasks.bulkPut(data.dailyTasks);
        if (data.pomodoroSessions) await db.pomodoroSessions.bulkPut(data.pomodoroSessions);
        if (data.aiConfig) await db.aiConfig.put(data.aiConfig);
        if (data.aiMessages) await db.aiMessages.bulkPut(data.aiMessages);
        if (data.dailySchedule) await db.dailySchedule.put(data.dailySchedule);
        if (data.milestones) await db.milestones.bulkPut(data.milestones);
        if (data.emergencyPlans) await db.emergencyPlans.bulkPut(data.emergencyPlans);
        if (data.milestoneProgress) await db.milestoneProgress.bulkPut(data.milestoneProgress);
        setMessage("✅ 数据已导入，刷新页面生效");
        setTimeout(() => window.location.reload(), 1500);
      } catch { setMessage("❌ 文件格式错误"); }
      setTimeout(() => setMessage(""), 2000);
    };
    input.click();
  };

  const handleSaveReview = async () => {
    const today = new Date().toISOString().split("T")[0];
    const note = reviewQuestions.map((q, i) => `${q}\n${reviewAnswers[i] || "（未回答）"}`).join("\n\n");
    const existing = await db.checkIns.get(today);
    if (existing) { await db.checkIns.update(today, { note }); }
    else {
      await db.checkIns.put({
        date: today, score: 0, totalMinutes: 0, tasksCompleted: 0,
        tasksTotal: 0, mood: 3 as const, note, didMinimum: false,
      });
    }
    // Also mark the weekly review task as completed
    const reviewTasks = await db.dailyTasks.where("date").equals(today).and((t) => t.title.includes("每周复盘")).toArray();
    for (const t of reviewTasks) {
      await db.dailyTasks.update(t.id, { completed: true, completedAt: new Date().toISOString() });
    }
    setReviewSaved(true);
    setTimeout(() => setReviewSaved(false), 2000);
  };

  const getServerUrl = () => {
    return localStorage.getItem("kaoyan_server_url") ||
      `http://${window.location.hostname}:3001`;
  };

  const handleSyncUpload = async () => {
    setSyncing(true); setMessage("");
    try {
      const data = {
        config: await db.config.get("main"), phases: await db.phases.toArray(),
        subjects: await db.subjects.toArray(), checkIns: await db.checkIns.toArray(),
        dailyTasks: await db.dailyTasks.toArray(), pomodoroSessions: await db.pomodoroSessions.toArray(),
        aiConfig: await db.aiConfig.get("main"), aiMessages: await db.aiMessages.toArray(),
        dailySchedule: await db.dailySchedule.get("main"),
        milestones: await db.milestones.toArray(), emergencyPlans: await db.emergencyPlans.toArray(),
        milestoneProgress: await db.milestoneProgress.toArray(),
      };
      const serverUrl = getServerUrl();
      const res = await fetch(`${serverUrl}/api/sync/upload`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("上传失败");
      const result = await res.json();
      setMessage(`✅ 已同步到电脑 (${new Date(result.time).toLocaleTimeString()})`);
    } catch { setMessage("❌ 同步失败，请确保电脑端服务器正在运行且同一 WiFi"); }
    setSyncing(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleSyncDownload = async () => {
    setSyncing(true); setMessage("");
    try {
      const serverUrl = getServerUrl();
      const res = await fetch(`${serverUrl}/api/sync/download`);
      if (!res.ok) throw new Error("下载失败");
      const data = await res.json();
      if (data.config) await db.config.put(data.config);
      if (data.phases) await db.phases.bulkPut(data.phases);
      if (data.subjects) await db.subjects.bulkPut(data.subjects);
      if (data.checkIns) await db.checkIns.bulkPut(data.checkIns);
      if (data.dailyTasks) await db.dailyTasks.bulkPut(data.dailyTasks);
      if (data.pomodoroSessions) await db.pomodoroSessions.bulkPut(data.pomodoroSessions);
      if (data.aiConfig) await db.aiConfig.put(data.aiConfig);
      if (data.aiMessages) await db.aiMessages.bulkPut(data.aiMessages);
      if (data.dailySchedule) await db.dailySchedule.put(data.dailySchedule);
      if (data.milestones) await db.milestones.bulkPut(data.milestones);
      if (data.emergencyPlans) await db.emergencyPlans.bulkPut(data.emergencyPlans);
      if (data.milestoneProgress) await db.milestoneProgress.bulkPut(data.milestoneProgress);
      setMessage("✅ 已从电脑同步数据，刷新页面生效");
      setTimeout(() => window.location.reload(), 1500);
    } catch { setMessage("❌ 同步失败，请确保电脑端服务器正在运行且同一 WiFi，且之前已上传过数据"); }
    setSyncing(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleCloudUpload = async () => {
    setCloudSyncing(true); setMessage("");
    try {
      const data = {
        config: await db.config.get("main"), phases: await db.phases.toArray(),
        subjects: await db.subjects.toArray(), checkIns: await db.checkIns.toArray(),
        dailyTasks: await db.dailyTasks.toArray(), pomodoroSessions: await db.pomodoroSessions.toArray(),
        aiConfig: await db.aiConfig.get("main"), aiMessages: await db.aiMessages.toArray(),
        dailySchedule: await db.dailySchedule.get("main"),
        milestones: await db.milestones.toArray(), emergencyPlans: await db.emergencyPlans.toArray(),
        milestoneProgress: await db.milestoneProgress.toArray(),
      };
      const result = await uploadToCloud(data);
      setMessage(result.ok ? `✅ ${result.message}` : `❌ ${result.message}`);
    } catch {
      setMessage("❌ 上传失败，请检查网络");
    }
    setCloudSyncing(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleCloudDownload = async () => {
    setCloudSyncing(true); setMessage("");
    try {
      const result = await downloadFromCloud();
      if (!result.ok || !result.data) {
        setMessage(`❌ ${result.message}`);
      } else {
        const data = result.data;
        if (data.config) await db.config.put(data.config as Parameters<typeof db.config.put>[0]);
        if (data.phases) await db.phases.bulkPut(data.phases as Parameters<typeof db.phases.bulkPut>[0]);
        if (data.subjects) await db.subjects.bulkPut(data.subjects as Parameters<typeof db.subjects.bulkPut>[0]);
        if (data.checkIns) await db.checkIns.bulkPut(data.checkIns as Parameters<typeof db.checkIns.bulkPut>[0]);
        if (data.dailyTasks) await db.dailyTasks.bulkPut(data.dailyTasks as Parameters<typeof db.dailyTasks.bulkPut>[0]);
        if (data.pomodoroSessions) await db.pomodoroSessions.bulkPut(data.pomodoroSessions as Parameters<typeof db.pomodoroSessions.bulkPut>[0]);
        if (data.aiConfig) await db.aiConfig.put(data.aiConfig as Parameters<typeof db.aiConfig.put>[0]);
        if (data.aiMessages) await db.aiMessages.bulkPut(data.aiMessages as Parameters<typeof db.aiMessages.bulkPut>[0]);
        if (data.dailySchedule) await db.dailySchedule.put(data.dailySchedule as Parameters<typeof db.dailySchedule.put>[0]);
        if (data.milestones) await db.milestones.bulkPut(data.milestones as Parameters<typeof db.milestones.bulkPut>[0]);
        if (data.emergencyPlans) await db.emergencyPlans.bulkPut(data.emergencyPlans as Parameters<typeof db.emergencyPlans.bulkPut>[0]);
        if (data.milestoneProgress) await db.milestoneProgress.bulkPut(data.milestoneProgress as Parameters<typeof db.milestoneProgress.bulkPut>[0]);
        setMessage("✅ 已从云端同步数据，刷新页面生效");
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch {
      setMessage("❌ 下载失败，请检查网络");
    }
    setCloudSyncing(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleReset = async () => {
    if (!window.confirm("确定要重置所有进度数据吗？学习记录将被清除，但计划本身会保留。此操作不可恢复！")) return;
    await db.checkIns.clear(); await db.dailyTasks.clear(); await db.pomodoroSessions.clear();
    await db.aiMessages.clear(); await db.milestoneProgress.clear();
    setMessage("✅ 进度已重置，刷新页面生效");
    setTimeout(() => window.location.reload(), 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-primary">⚙️ 设置</h1>
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === tab.id ? "bg-primary text-white" : "bg-white text-text border border-mid hover:bg-light"
            )}
          >{tab.label}</button>
        ))}
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-mid">
        {/* 🎒 锦囊 */}
        {activeTab === "pouch" && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <p className="text-4xl mb-2">🎒</p>
              <h3 className="font-bold text-primary text-lg">考研锦囊</h3>
              <p className="text-sm text-muted mt-1">每次打开，随机送你一个「撑下去」的理由</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pouches.map((pouch, i) => (
                <button
                  key={i}
                  onClick={() => setOpenPouch(openPouch === i ? null : i)}
                  className={`text-left rounded-xl border-2 transition-all duration-300 ${
                    openPouch === i
                      ? "border-accent bg-accent/5 shadow-md scale-[1.02]"
                      : "border-mid hover:border-primary/30 bg-white"
                  }`}
                >
                  {openPouch === i ? (
                    <div className="p-5">
                      <p className="text-3xl mb-3">{pouch.icon}</p>
                      <p className="text-lg font-bold text-primary mb-2">{pouch.title}</p>
                      <p className="text-sm text-accent font-medium italic mb-3">&ldquo;{pouch.quote}&rdquo;</p>
                      <p className="text-sm text-text leading-relaxed">{pouch.body}</p>
                      <div className="mt-4 pt-3 border-t border-mid">
                        <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full font-medium">
                          🏷️ {pouch.tag}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 flex items-center gap-4">
                      <span className="text-3xl">{pouch.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-primary text-sm">{pouch.title}</p>
                        <p className="text-xs text-muted truncate">{pouch.quote}</p>
                      </div>
                      <span className="text-muted text-sm">展开</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 📝 每周复盘 */}
        {activeTab === "review" && (
          <div className="space-y-4">
            <h3 className="font-bold text-primary">📝 每周复盘</h3>
            <p className="text-sm text-muted">
              每周日会自动在任务列表中添加复盘任务。完成后回来填写。
            </p>
            <div className="space-y-3">
              {reviewQuestions.map((q, i) => (
                <div key={i}>
                  <label className="text-sm font-medium text-text block mb-1">{q}</label>
                  <textarea
                    value={reviewAnswers[i] || ""}
                    onChange={(e) => setReviewAnswers((prev) => ({ ...prev, [i]: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-mid text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    placeholder="写下你的想法..."
                  />
                </div>
              ))}
              <Button onClick={handleSaveReview} className="bg-primary hover:bg-primary-light text-white">
                {reviewSaved ? "✅ 已保存" : "💾 保存复盘"}
              </Button>
            </div>
          </div>
        )}

        {/* Word Import */}
        {activeTab === "word" && (
          <div className="space-y-4">
            <h3 className="font-bold text-primary">📄 导入 Word 计划</h3>
            <p className="text-sm text-muted">拖拽或点击上传 .docx 文件，自动解析并替换当前的备考计划</p>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleDocxFile(f); }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                dragging ? "border-primary bg-primary/5" : "border-mid hover:border-primary/50"
              }`}
            >
              <input ref={fileInputRef} type="file" accept=".docx" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleDocxFile(f); }} />
              <p className="text-3xl mb-2">📁</p>
              <p className="text-sm text-muted">{docxLoading ? "解析中..." : "拖拽 .docx 文件到此处，或点击选择"}</p>
            </div>
            {docxError && <p className="text-sm text-warn bg-warn/5 rounded-lg px-3 py-2">{docxError}</p>}
            {docxResult && (
              <div className="bg-success/5 rounded-xl p-4 border border-success/20">
                <p className="text-sm font-medium text-success mb-2">✅ 解析成功</p>
                <pre className="text-xs text-text overflow-x-auto whitespace-pre-wrap max-h-40">
                  {JSON.stringify(docxResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* AI Buddy */}
        {activeTab === "ai" && aiConfig && (
          <div className="space-y-4">
            <h3 className="font-bold text-primary">🎭 AI 搭子设置</h3>

            {/* AI Provider */}
            <div>
              <label className="text-sm font-medium text-text block mb-2">🤖 AI 模型</label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { id: "deepseek", label: "DeepSeek" },
                  { id: "openai", label: "OpenAI" },
                  { id: "claude", label: "Claude" },
                  { id: "custom", label: "自定义" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        localStorage.setItem("ai_provider", opt.id);
                        // Force re-render
                        setAiConfig({ ...aiConfig });
                      }
                    }}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      (typeof window !== "undefined" ? localStorage.getItem("ai_provider") || "deepseek" : "deepseek") === opt.id
                        ? "bg-primary text-white"
                        : "bg-white border border-mid text-text hover:bg-light"
                    }`}
                  >{opt.label}</button>
                ))}
              </div>
            </div>

            {/* API Key */}
            <div>
              <label className="text-sm font-medium text-text block mb-2">🔑 API Key</label>
              <input type="password"
                defaultValue={typeof window !== "undefined" ? localStorage.getItem("ai_api_key") || "" : ""}
                onChange={(e) => {
                  if (typeof window !== "undefined") localStorage.setItem("ai_api_key", e.target.value.trim());
                }}
                className="w-full px-3 py-2 rounded-lg border border-mid text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="输入你的 API Key..." />
              <p className="text-xs text-muted mt-1">Key 仅存本地，不会上传</p>
            </div>

            {/* Custom endpoint + model (only for custom) */}
            {(typeof window !== "undefined" ? localStorage.getItem("ai_provider") || "" : "") === "custom" && (
              <>
                <div>
                  <label className="text-sm font-medium text-text block mb-2">自定义接口地址</label>
                  <input type="text"
                    defaultValue={typeof window !== "undefined" ? localStorage.getItem("ai_endpoint") || "" : ""}
                    onChange={(e) => {
                      if (typeof window !== "undefined") localStorage.setItem("ai_endpoint", e.target.value.trim());
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-mid text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="https://api.openai.com/v1/chat/completions" />
                </div>
                <div>
                  <label className="text-sm font-medium text-text block mb-2">模型名称</label>
                  <input type="text"
                    defaultValue={typeof window !== "undefined" ? localStorage.getItem("ai_model") || "" : ""}
                    onChange={(e) => {
                      if (typeof window !== "undefined") localStorage.setItem("ai_model", e.target.value.trim());
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-mid text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="gpt-4o-mini 或 deepseek-chat" />
                </div>
              </>
            )}

            {/* Model override for built-in providers */}
            {(typeof window !== "undefined" && !["custom"].includes(localStorage.getItem("ai_provider") || "")) && (
              <div>
                <label className="text-sm font-medium text-text block mb-2">模型（可选，留空用默认）</label>
                <input type="text"
                  defaultValue={typeof window !== "undefined" ? localStorage.getItem("ai_model") || "" : ""}
                  onChange={(e) => {
                    if (typeof window !== "undefined") localStorage.setItem("ai_model", e.target.value.trim());
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-mid text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder={(() => {
                    const p = typeof window !== "undefined" ? localStorage.getItem("ai_provider") || "deepseek" : "deepseek";
                    const defaults: Record<string, string> = {
                      deepseek: "deepseek-chat", openai: "gpt-4o-mini", claude: "claude-haiku-4-5-20251001",
                    };
                    return defaults[p] || "";
                  })()} />
              </div>
            )}

            <hr className="border-mid" />

            {/* Personality */}
            <div>
              <label className="text-sm font-medium text-text block mb-2">语气风格</label>
              <div className="grid grid-cols-2 gap-2">
                {personalityOptions.map((opt) => (
                  <button key={opt.value}
                    onClick={() => setAiConfig((prev) => prev ? { ...prev, personality: opt.value as AIBuddyConfig["personality"] } : prev)}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      aiConfig.personality === opt.value ? "bg-primary text-white" : "bg-white border border-mid text-text hover:bg-light"
                    }`}>{opt.label}</button>
                ))}
              </div>
            </div>
            {aiConfig.personality === "custom" && (
              <div>
                <label className="text-sm font-medium text-text block mb-2">自定义搭子性格</label>
                <textarea value={aiConfig.customPrompt || ""}
                  onChange={(e) => setAiConfig((prev) => prev ? { ...prev, customPrompt: e.target.value } : prev)}
                  rows={3} className="w-full px-3 py-2 rounded-lg border border-mid text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  placeholder="描述你想要的搭子性格..." />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-text block mb-2">主动程度</label>
              <div className="flex gap-2">
                {proactivityOptions.map((opt) => (
                  <button key={opt.value}
                    onClick={() => setAiConfig((prev) => prev ? { ...prev, proactivity: opt.value as AIBuddyConfig["proactivity"] } : prev)}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      aiConfig.proactivity === opt.value ? "bg-primary text-white" : "bg-white border border-mid text-text hover:bg-light"
                    }`}>{opt.label}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-text block mb-2">搭子怎么称呼你</label>
              <input type="text" value={aiConfig.nickname}
                onChange={(e) => setAiConfig((prev) => prev ? { ...prev, nickname: e.target.value } : prev)}
                className="w-full px-3 py-2 rounded-lg border border-mid text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="你的名字或昵称" />
            </div>
            <Button onClick={saveAiConfig} className="bg-primary hover:bg-primary-light text-white">
              {aiSaved ? "✅ 已保存" : "💾 保存设置"}
            </Button>
          </div>
        )}

        {activeTab === "update" && <UpdateChecker />}

        {activeTab === "data" && (
          <div className="space-y-6">
            {/* Sync */}
            <div>
              <h3 className="font-bold text-primary mb-2">🔄 手机与电脑同步</h3>
              <p className="text-xs text-muted mb-3">手机和电脑同一网络，电脑开着 npm run dev 即可</p>
              <div className="mb-3">
                <label className="text-xs font-medium text-text block mb-1">电脑地址（IP:端口）</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    defaultValue={
                      typeof window !== "undefined"
                        ? localStorage.getItem("kaoyan_server_url") || ""
                        : ""
                    }
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      if (val) localStorage.setItem("kaoyan_server_url", val);
                      else localStorage.removeItem("kaoyan_server_url");
                    }}
                    className="flex-1 px-3 py-2 rounded-lg border border-mid text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="例如 http://192.168.43.10:3001"
                  />
                </div>
                <p className="text-xs text-muted mt-1">
                  电脑连手机热点时，地址通常是 http://192.168.43.xx:3001
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleSyncUpload} disabled={syncing}
                  className="bg-success hover:bg-success/90 text-white">
                  📤 {syncing ? "同步中..." : "手机 → 电脑"}
                </Button>
                <Button onClick={handleSyncDownload} disabled={syncing} variant="outline">
                  📥 电脑 → 手机
                </Button>
              </div>
            </div>

            <hr className="border-mid" />

            {/* Cloud Sync */}
            <div>
              <h3 className="font-bold text-primary mb-2">☁️ 云端同步</h3>
              <p className="text-xs text-muted mb-3">设一个同步码，手机和电脑用同一个码就能同步，不需要同一 WiFi</p>
              <div className="mb-3">
                <label className="text-xs font-medium text-text block mb-1">同步码</label>
                <input
                  type="text"
                  defaultValue={
                    typeof window !== "undefined"
                      ? localStorage.getItem("sync_code") || ""
                      : ""
                  }
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    if (val) localStorage.setItem("sync_code", val);
                    else localStorage.removeItem("sync_code");
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-mid text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="设置一个只有你知道的同步码"
                />
                <p className="text-xs text-muted mt-1">
                  相同同步码的设备共享同一份数据
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleCloudUpload} disabled={cloudSyncing}
                  className="bg-success hover:bg-success/90 text-white">
                  📤 {cloudSyncing ? "同步中..." : "上传到云端"}
                </Button>
                <Button onClick={handleCloudDownload} disabled={cloudSyncing}
                  variant="outline">
                  📥 从云端下载
                </Button>
              </div>
            </div>

            <hr className="border-mid" />

            {/* Export/Import */}
            <div>
              <h3 className="font-bold text-primary mb-2">📁 备份与恢复</h3>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleExport} variant="outline">📤 导出备份文件</Button>
                <Button onClick={handleImport} variant="outline">📥 从备份恢复</Button>
                <Button onClick={handleReset} variant="outline" className="text-warn border-warn hover:bg-warn/5">🔄 重置进度</Button>
              </div>
            </div>

            {message && <p className="text-sm font-medium text-success">{message}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
