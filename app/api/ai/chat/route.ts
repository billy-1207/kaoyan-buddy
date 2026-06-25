import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/ai-persona";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: "messages array required" }, { status: 400 });
    }

    const systemPrompt = await buildSystemPrompt();

    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey || apiKey === "your-api-key-here") {
      // Mock response when no API key configured
      return NextResponse.json({
        reply: "（你需要先设置 CLAUDE_API_KEY 环境变量才能和我聊天哦~ 在 .env.local 文件中配置你的 API Key 吧！）",
      });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.slice(-20),
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `Claude API error: ${errText}` }, { status: response.status });
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || "（搭子正在发呆...请再试一次）";
    return NextResponse.json({ reply });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
