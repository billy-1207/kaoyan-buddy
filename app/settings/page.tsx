"use client";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { UpdateChecker } from "@/components/settings/UpdateChecker";
import { uploadToCloud, downloadFromCloud } from "@/lib/supabase-service";
import { BuddyAvatar } from "@/components/ai-buddy/BuddyAvatar";
import type { AIBuddyConfig } from "@/lib/plan-schema";

const tabs = [
  { id: "pouch", label: "🎒 锦囊" },
  { id: "review", label: "📝 每周复盘" },
  { id: "word", label: "📄 导入计划" },
  { id: "ai", label: "🎭 AI 搭子" },
  { id: "update", label: "🔄 检查更新" },
  { id: "data", label: "💾 数据管理" },
];

const pouchPool = [
  { icon: "⏱️", title: "今天只学 2 分钟", quote: "你不是不想学，你只是不想开始。", body: "万事开头难是骗人的。真正难的不是「做2小时数学」，而是「把屁股放到椅子上」。当你不想学的时候，和自己说：「我只学2分钟。2分钟后不想学了就停。」——几乎每次，一旦开始就不会停。", tag: "启动困难用这个" },
  { icon: "⛓️", title: "链不能断", quote: "连续性是习惯的氧气。", body: "今天状态再差，完成「最低版本」就行——做一道数学题、背50个单词、出门走一圈。一共40分钟。一天都不允许完全中断。因为断一次，「反正昨天也没学」的心态会让你断第二次、第三次。", tag: "状态差时用这个" },
  { icon: "☕", title: "把诱惑绑在学习上", quote: "利用你想做的事，驱动你该做的事。", body: "只有学习的时候才能喝你最爱的咖啡。只有完成上午任务后才能刷10分钟视频。把高频行为（刷手机）和低频行为（学习）绑定——你的大脑会主动想学。", tag: "缺动力时用这个" },
  { icon: "📅", title: "画一个满满的✓", quote: "看得见的进步，才是持续的动力。", body: "在墙上贴一张大日历，每完成一天就在那天画一个大大的✓。做一张「180天倒计时」进度条，每过一天涂一格。大脑对视觉化进度毫无抵抗力。", tag: "缺成就感时用这个" },
  { icon: "🍅", title: "种一棵番茄树", quote: "25分钟，只做一件事。", body: "把手机放另一个房间。设25分钟倒计时。任何「想查一下」的冲动写到便签纸上，番茄结束后再处理。每完成一个番茄就种一棵虚拟树——你的专注森林正在生长。", tag: "注意力涣散用这个" },
  { icon: "🎯", title: "你是自己的主人", quote: "自主、胜任、归属——三个需求满足，动机自然产生。", body: "自主感：每天的学习顺序你自己定。胜任感：每周末回顾一下「这周我学会了什么之前不会的」。归属感：找1-2个研友，每天互相打卡。独自学习最容易陷入「只有我最痛苦」的错觉。", tag: "迷茫时用这个" },
  { icon: "🌈", title: "让今天以「我能行」结束", quote: "好的结束 = 明天期待继续。", body: "诺贝尔奖得主发现：人们对一段经历的记忆，取决于「最强烈的时刻」和「最后时刻」。所以每天最后一个学习动作，做一道你会做的题。让今天在自信中结束，明天才想继续。", tag: "收尾时用这个" },

  { icon: "🏃", title: "5分钟法则", quote: "任何事只做5分钟。5分钟后想停就停。", body: "大脑对「开始」的抗拒远大于「持续」。告诉自己只做5分钟，翻开书、写两个字。5分钟到了你99%会继续。行动本身会消除抗拒。", tag: "启动困难" },
  { icon: "📉", title: "允许退步日", quote: "进步不是线性的，螺旋上升才是常态。", body: "今天做题错得比昨天多？太棒了，你找到薄弱点了。每次退步都是系统在告诉你：这里需要加固。接纳退步，精准补上。", tag: "挫败时" },
  { icon: "🧩", title: "换个科目就是休息", quote: "最好的休息不是刷手机，是换脑。", body: "学数学累了背英语，背累了做政治。不同脑区切换本身就是休息。刷手机只会让大脑更累。", tag: "疲劳时" },
  { icon: "🪞", title: "想象考完的自己", quote: "现在的每一分钟，都在给考完的自己写信。", body: "闭眼想象考试结束那天的自己——是懊悔「当初再多学一点就好了」，还是欣慰「感谢那段时间拼尽全力的自己」？答案你现在就在写。", tag: "缺动力" },
  { icon: "🧠", title: "睡眠是最好的复习", quote: "你睡着的时候，大脑在帮你整理。", body: "睡眠中大脑会整理记忆、强化神经连接。熬夜4小时不如正常睡觉+早起2小时。别拿睡眠换学习时间。", tag: "熬夜时" },
  { icon: "🗑️", title: "扔掉完美主义", quote: "完成比完美重要100倍。", body: "一道题卡了半小时？跳过、标记、回头再啃。作文开头不满意？写完再说。考研不是比谁每道题完美，是比总分。", tag: "追求完美" },
  { icon: "🌊", title: "顺其自然，为所当为", quote: "焦虑不是敌人，对抗焦虑才是。", body: "森田疗法核心：接纳内心的不安，但该做什么就做什么。带着焦虑翻开书本，行动本身就会消解焦虑。不要等不焦虑了再行动。", tag: "焦虑时" },
  { icon: "📖", title: "费曼学习法", quote: "教给别人是最高效的学习。", body: "假装把知识点讲给完全不懂的人听。用最简单的语言解释。卡住的地方就是没真懂的地方。能讲明白才算真会。", tag: "学不进去" },
  { icon: "🎲", title: "计划要留白", quote: "过满的计划 = 必然会失败。", body: "不要排满每一分钟。留20%空白。今天只列3件最重要的事，完成就算赢。排越满越容易崩盘——比不排还糟。", tag: "做计划" },
  { icon: "🛑", title: "刷题要「停」", quote: "做100道题不如搞懂10道错题。", body: "做完一套卷子不要立刻刷下一套。停下来拆解错题：为什么错？知识漏洞还是粗心？正确路径是什么？一周后重做还会吗？这才是有效刷题。", tag: "刷题时" },
  { icon: "💧", title: "高原期是好事", quote: "感觉没进步时，恰是进步最快时。", body: "学习曲线有平台期——努力很久却感觉原地踏步。这是大脑在重构知识网络。继续坚持，突破就在下一次。", tag: "瓶颈期" },
  { icon: "🏆", title: "考研是排位赛", quote: "你不需要满分，你只需要比别人多1分。", body: "考研是选拔考试。精力放在提分性价比最高的地方：薄弱科目空间最大，重点攻克。", tag: "迷茫时" },
  { icon: "📵", title: "手机是时间黑洞", quote: "你和手机的关系 = 你和录取通知书的关系。", body: "把手机设灰度模式（辅助功能→显示）。鲜艳颜色专门设计来抓注意力。灰色让一切变无聊，刷手机的欲望大幅下降。", tag: "放不下手机" },
  { icon: "🧘", title: "健康是第一生产力", quote: "身体状态 = 学习效率。", body: "考研是马拉松不是拼命。规律吃饭、每周运动、保持社交。身体好的那天效率是差的3倍。投资健康就是投资分数。", tag: "透支时" },
  { icon: "🎁", title: "设计你的奖励", quote: "大脑需要即时反馈才能持续。", body: "完成3件要事→奖励一集剧。完成一周→吃顿好的。完成一阶段→买想要的书。给大脑期待，它会推着你往前。", tag: "缺动力" },
  { icon: "🔋", title: "番茄钟不是闹钟", quote: "25分钟的魔法在于重新开始。", body: "走神了不要自责，直接开始。25分钟后重新计时，那是全新的25分钟。上一个不完美的番茄已经过去了。你永远可以重新开始。", tag: "注意力差" },
  { icon: "🤝", title: "找个不会辜负的人", quote: "恐惧驱动 = 焦虑。行为驱动 = 行动。", body: "找一个最信任的朋友，约定：今天没完成最低学习量就给他转200块钱。或者公开你的考研计划——「从今天起，每天打卡180天」。公开承诺后，你的大脑会自动让行为与承诺一致。", tag: "需要监督时用这个" },
];

interface PouchItem { icon: string; title: string; quote: string; body: string; tag: string; }
const REVIEW_COUNT = 8;

function shuffleFromPool(pool: PouchItem[]) {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, REVIEW_COUNT);
}

function getCurrentPool(): PouchItem[] {
  if (typeof window === "undefined") return pouchPool;
  const p = (window as unknown as Record<string, unknown>).__pouchPool;
  return Array.isArray(p) ? (p as PouchItem[]) : pouchPool;
}

function shufflePouches() {
  return shuffleFromPool(getCurrentPool());
}

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
  const [pouches, setPouches] = useState(() => shufflePouches());
  const [pouchSource, setPouchSource] = useState<"loading" | "network" | "local">("loading");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // DOCX text parser (client-side, works without server)
  function parsePlanText(text: string) {
    const extracted: Record<string, unknown> = {
      targetSchool: text.match(/目标院校[：:]\s*(.+)/)?.[1]?.trim() || "",
      targetMajor: "人工智能专业",
      targetScore: text.match(/目标总分[：:]\s*(\d+)/)?.[1] ? parseInt(text.match(/目标总分[：:]\s*(\d+)/)![1]) : 390,
      prepPeriod: text.match(/备考周期[：:]\s*(.+)/)?.[1]?.trim() || "",
      subjects: [] as string[],
      phases: [] as string[],
    };
    const phasePattern = /第[一二三四]阶段[：:]\s*([^\n]+)/g;
    let match;
    while ((match = phasePattern.exec(text)) !== null) {
      (extracted.phases as string[]).push(match[1].trim());
    }
    const subjectPattern = /(数学|408|英语|政治)[^\n]*目标/g;
    while ((match = subjectPattern.exec(text)) !== null) {
      (extracted.subjects as string[]).push(match[0].trim());
    }
    return extracted;
  }

  // Fetch pouches from GitHub (can update without rebuilding APK)
  useEffect(() => {
    const GITHUB_POUCHES_URL =
      "https://raw.githubusercontent.com/billy-1207/kaoyan-buddy/master/public/pouches.json";
    const CACHE_KEY = "kaoyan_pouches_cache";

    (async () => {
      try {
        const res = await fetch(GITHUB_POUCHES_URL, {
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json) && json.length > 0) {
            localStorage.setItem(CACHE_KEY, JSON.stringify(json));
            // Merge with any new network pouches
            const merged = [...json]; // network data
            (window as unknown as Record<string, unknown>).__pouchPool = merged;
            setPouchSource("network");
            setPouches(shuffleFromPool(merged));
            return;
          }
        }
      } catch {}
      // Try cache
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const json = JSON.parse(cached);
          if (Array.isArray(json) && json.length > 0) {
            (window as unknown as Record<string, unknown>).__pouchPool = json;
            setPouchSource("local");
            setPouches(shuffleFromPool(json));
            return;
          }
        }
      } catch {}
      // Fall back to built-in pool
      (window as unknown as Record<string, unknown>).__pouchPool = pouchPool;
      setPouchSource("local");
      setPouches(shufflePouches());
    })();
  }, []);

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
      // Parse client-side using mammoth (works in browser & APK)
      const mammoth = await import("mammoth");
      const buffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ buffer: buffer as unknown as Buffer });
      const extracted = parsePlanText(result.value);
      setDocxResult(extracted);
    } catch { setDocxError("解析失败，请检查文件格式（.docx，非 .doc）"); }
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
              <p className="text-sm text-muted mt-1">
                {pouchSource === "loading"
                  ? "正在更新锦囊..."
                  : pouchSource === "network"
                  ? `☁️ 已获取最新锦囊，共 ${getCurrentPool().length} 条`
                  : `共 ${getCurrentPool().length} 条`}
              </p>
              <Button
                variant="outline"
                size="xs"
                onClick={() => setPouches(shufflePouches())}
                className="mt-2"
              >
                🔄 换一批
              </Button>
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

            {/* Avatar Upload */}
            <div className="flex items-center gap-4 p-4 bg-light rounded-xl">
              <BuddyAvatar size="lg" />
              <div>
                <p className="text-sm font-medium text-text">搭子头像</p>
                <p className="text-xs text-muted mb-2">上传一张照片作为搭子形象</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = async (e: Event) => {
                        const target = e.target as HTMLInputElement;
                        const file = target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = async () => {
                          const avatarUrl = reader.result as string;
                          const updated = { ...aiConfig, avatarUrl };
                          setAiConfig(updated);
                          await db.aiConfig.put(updated);
                          window.dispatchEvent(new Event("buddy-avatar-changed"));
                        };
                        reader.readAsDataURL(file);
                      };
                      input.click();
                    }}
                  >
                    📷 上传照片
                  </Button>
                  {aiConfig.avatarUrl && (
                    <Button
                      variant="outline"
                      size="xs"
                      className="text-warn border-warn hover:bg-warn/5"
                      onClick={async () => {
                        const updated = { ...aiConfig, avatarUrl: undefined };
                        setAiConfig(updated);
                        await db.aiConfig.put(updated);
                        window.dispatchEvent(new Event("buddy-avatar-changed"));
                      }}
                    >
                      🗑 还原默认
                    </Button>
                  )}
                </div>
              </div>
            </div>

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
