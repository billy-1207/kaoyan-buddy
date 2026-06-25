import { db } from "./db";

export async function buildSystemPrompt(): Promise<string> {
  const config = await db.config.get("main");
  const aiConfig = await db.aiConfig.get("main");
  const subjects = await db.subjects.toArray();
  const phases = await db.phases.orderBy("order").toArray();
  const today = new Date().toISOString().split("T")[0];
  const checkIns = await db.checkIns.toArray();
  const todayTasks = await db.dailyTasks.where("date").equals(today).toArray();

  const currentPhase = phases.find((p) => today >= p.startDate && today <= p.endDate);

  let streak = 0;
  const now = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const ci = checkIns.find((c) => c.date === dateStr);
    if (ci && ci.didMinimum) streak++;
    else if (i > 0) break;
  }

  const allTasks = await db.dailyTasks.toArray();
  const subjectProgress = subjects
    .map((s) => {
      const st = allTasks.filter((t) => t.subjectId === s.id);
      const completed = st.filter((t) => t.completed).length;
      const total = Math.max(st.length, 1);
      return `${s.name} ${Math.round((completed / total) * 100)}%`;
    })
    .join("，");

  const todayCompleted = todayTasks.filter((t) => t.completed).length;
  const todayTotal = todayTasks.length;
  const todayStr =
    todayTotal === 0
      ? "还没有开始学习"
      : `完成了 ${todayCompleted}/${todayTotal} 个任务`;

  const personality = aiConfig?.personality || "balanced";
  const nickname = aiConfig?.nickname || "考研人";

  const styleDirectives: Record<string, string> = {
    strict:
      "语气严厉但关心，直接指出问题，催促行动。比如：'还没开始学？今天的数学不等你。'",
    gentle:
      "温柔包容，多用鼓励和肯定，不说教。比如：'没事的，慢慢来，你已经比昨天进步了~'",
    balanced:
      "根据上下文自适应——用户拖延时严格催促，用户努力时温柔鼓励，用户焦虑时安抚。",
    custom: aiConfig?.customPrompt || "像朋友一样自然地聊天，提供考研备考的陪伴和支持。",
  };

  return `你是${nickname}的考研搭子，一个24小时陪伴ta备考的AI伙伴。

[考研计划]
- 目标：${config?.targetSchool || "未知"} ${config?.targetMajor || ""}
- 备考科目：11408（数学一、408计算机综合、英语一、政治）
- 备考周期：${config?.startDate || ""} 到 ${config?.examDate || ""}，共 ${config?.totalDays || 0} 天
- 当前阶段：${currentPhase?.name || "未开始"}
- 当前进度：${subjectProgress}
- 连续打卡：${streak} 天
- 今日状态：${todayStr}

[性格模式] ${personality}
${styleDirectives[personality] || styleDirectives.balanced}

[工作原理]
1. 你完全了解用户的备考计划和当前进度
2. 你能回答各科目的概念性问题（数学、408计算机、英语、政治）
3. 在用户情绪低落时，启动心理学工具：
   - 「最低版本」：建议只做40分钟的最小学习量
   - 「2分钟法则」：建议只学2分钟，降低启动压力
   - 「番茄工作法」：建议25分钟专注
4. 不鼓励过度学习（每天不超过10小时）
5. 不制造焦虑（不说"你考不上了"之类的话），但也不放任摆烂
6. 回复简洁温暖，控制在2-5句话`;
}
