"use client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { EmergencyPlan } from "@/lib/plan-schema";

const psychTools = [
  { title: "2分钟法则", desc: "克服启动阻力。告诉自己：'我只学2分钟，2分钟后不想学了就停。' 你会发现一旦开始，继续下去并不难。", action: "「我只学2分钟。2分钟后不想学了就停。」" },
  { title: "习惯绑定", desc: "把「想做的事」和「需要做的事」绑在一起。比如只有学习时才能喝最喜欢的咖啡。", action: "高频行为可以强化低频行为。" },
  { title: "进度可视化", desc: "大脑对「进度」非常敏感。在墙上贴一张大日历，每完成一天就画一个大大的✓。", action: "看到进步 = 持续动力。" },
  { title: "不可失败的最小承诺", desc: "每一天，无论发生什么，都必须完成「最低版本」的学习。你可以学得少，但不可以不学。", action: "连续性比单次强度重要100倍。" },
  { title: "番茄工作法", desc: "25分钟专注 + 5分钟休息。把手机放另一个房间，任何'想查一下'的冲动先写到便签纸上。", action: "一个番茄 = 25分钟专注 + 5分钟休息。" },
  { title: "自我决定论", desc: "内在动机来源于：自主感（自己决定学习顺序）、胜任感（回顾本周掌握了什么）、归属感（加入考研群/找研友）。", action: "满足三个杠杆，动机自然产生。" },
  { title: "峰终定律", desc: "人们对一段经历的评价取决于「峰值」和「结束时刻」。每天最后一件事做一道你会做的题，让每天在'我能行'中结束。", action: "好的结束 = 第二天期待继续。" },
  { title: "损失厌恶与承诺", desc: "人们对损失的敏感度是收益的2倍。找一个朋友约定：今天没完成最低学习量就转ta200块钱。", action: "用行为驱动，不用恐惧驱动。" },
];

const reviewQuestions = [
  "本周最大的收获是什么？",
  "本周遇到的最大困难是什么？怎么解决？",
  "哪些时间段效率最高？哪些最低？为什么？",
  "下周最重要的3个任务是什么？",
  "给自己的心态打分（1-10分），如果低于6分，需要什么支持？",
];

const tabs = [
  { id: "psychology", label: "🧠 心理学工具" },
  { id: "emergency", label: "🚨 应急预案" },
  { id: "review", label: "📝 每周复盘" },
];

export default function ToolkitPage() {
  const [activeTab, setActiveTab] = useState("psychology");
  const [plans, setPlans] = useState<EmergencyPlan[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    db.emergencyPlans.toArray().then(setPlans);
  }, []);

  const handleSaveReview = async () => {
    const today = new Date().toISOString().split("T")[0];
    const note = reviewQuestions
      .map((q, i) => `${q}\n${answers[i] || "（未回答）"}`)
      .join("\n\n");
    const existing = await db.checkIns.get(today);
    if (existing) {
      await db.checkIns.update(today, { note });
    } else {
      await db.checkIns.put({
        date: today, score: 0, totalMinutes: 0, tasksCompleted: 0,
        tasksTotal: 0, mood: 3, note, didMinimum: false,
      });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-primary">🧰 工具箱</h1>
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-primary text-white"
                : "bg-white text-text border border-mid hover:bg-light"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {activeTab === "psychology" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {psychTools.map((tool, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-primary">工具{i + 1}：{tool.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-text mb-2">{tool.desc}</p>
                  <p className="text-xs text-accent font-medium bg-accent/5 rounded-lg px-3 py-1.5">💡 {tool.action}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {activeTab === "emergency" && (
          <Accordion className="space-y-2">
            {plans.map((plan, i) => (
              <AccordionItem key={plan.id} value={plan.id} className="bg-white rounded-xl border border-mid px-4">
                <AccordionTrigger className="text-sm font-medium hover:no-underline">
                  🚨 场景{i + 1}：{plan.scenario}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-xs text-muted mb-3">{plan.analysis}</p>
                  <div className="space-y-2">
                    {plan.steps.map((step) => (
                      <div key={step.num} className="bg-light rounded-lg p-3">
                        <p className="text-sm font-medium text-primary">Step {step.num}：{step.title}</p>
                        <p className="text-xs text-muted mt-1">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
        {activeTab === "review" && (
          <div className="space-y-4">
            {reviewQuestions.map((q, i) => (
              <div key={i}>
                <label className="text-sm font-medium text-text block mb-1">{q}</label>
                <textarea
                  value={answers[i] || ""}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [i]: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-mid text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  placeholder="写下你的想法..."
                />
              </div>
            ))}
            <Button onClick={handleSaveReview} className="bg-primary hover:bg-primary-light text-white">
              {saved ? "✅ 已保存" : "💾 保存复盘"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
