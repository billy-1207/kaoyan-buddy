"use client";
import { useState, useRef, useEffect } from "react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { aiChat } from "@/lib/api";
import type { AIMessage, AIBuddyConfig } from "@/lib/plan-schema";

export default function AIBuddyPage() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<AIBuddyConfig | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    db.aiConfig.get("main").then((c) => setConfig(c ?? null));
    db.aiMessages.orderBy("timestamp").toArray().then(setMessages);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: AIMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
      const reply = await aiChat(history);
      const assistantMsg: AIMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: reply,
        timestamp: Date.now() + 1,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      await db.aiMessages.bulkPut([userMsg, assistantMsg]);
    } catch {
      const errorMsg: AIMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: "（连接不上搭子了...检查一下网络？）",
        timestamp: Date.now() + 1,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    await db.aiMessages.clear();
    setMessages([]);
  };

  const personalityLabel =
    !config
      ? "⚖️ 平衡"
      : config.personality === "strict"
      ? "😤 严厉"
      : config.personality === "gentle"
      ? "🤗 温柔"
      : "⚖️ 平衡";

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold text-primary">🤖 AI 考研搭子</h1>
      <div className="flex flex-col h-[70vh] lg:h-[calc(100vh-12rem)] bg-white rounded-xl shadow-sm border border-mid overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-mid bg-light/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <div>
              <p className="font-medium text-sm text-primary">
                AI 考研搭子
                {config && (
                  <span className="text-muted font-normal ml-2">· {personalityLabel}</span>
                )}
              </p>
            </div>
          </div>
          <button onClick={clearHistory} className="text-xs text-muted hover:text-warn transition-colors">
            清空对话
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🤖</p>
              <p className="text-muted text-sm">你的考研搭子随时待命</p>
              <p className="text-muted text-xs mt-1">问问题、聊天、吐槽都可以~</p>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-3`}
            >
              <div className={`flex gap-2 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                    msg.role === "user" ? "bg-primary text-white" : "bg-accent text-white"
                  }`}
                >
                  {msg.role === "user" ? "👤" : "🤖"}
                </div>
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-white rounded-tr-sm"
                      : "bg-white border border-mid text-text rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start mb-3">
              <div className="bg-white border border-mid rounded-2xl rounded-tl-sm px-4 py-2.5">
                <span className="text-sm text-muted animate-pulse">搭子正在输入...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="p-4 border-t border-mid flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="和你的搭子说点什么..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-mid text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !input.trim()} className="bg-primary hover:bg-primary-light text-white">
            发送
          </Button>
        </form>
      </div>
    </div>
  );
}
