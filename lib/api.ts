// API helper — works on both web and mobile
// Supports multiple AI providers

const SERVER_URL_KEY = "kaoyan_server_url";

export async function getServerUrl(): Promise<string> {
  const saved = localStorage.getItem(SERVER_URL_KEY);
  if (saved) return saved;
  return "";
}

// ── AI Providers ──

function extractReply(data: Record<string, unknown>): string {
  // OpenAI-compatible format
  const choices = data.choices as Array<{ message?: { content?: string } }> | undefined;
  if (choices?.[0]?.message?.content) return choices[0].message.content;

  // Claude format
  const content = data.content as Array<{ text?: string }> | undefined;
  if (content?.[0]?.text) return content[0].text;

  return "";
}

interface AIProviderConfig {
  name: string;
  endpoint: string;
  model: string;
  buildRequest: (model: string, messages: { role: string; content: string }[], apiKey: string) => { url: string; headers: Record<string, string>; body: string };
}

const PROVIDERS: Record<string, AIProviderConfig> = {
  deepseek: {
    name: "DeepSeek",
    endpoint: "https://api.deepseek.com/v1/chat/completions",
    model: "deepseek-chat",
    buildRequest: (model, messages, apiKey) => ({
      url: "https://api.deepseek.com/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        max_tokens: 1024,
      }),
    }),
  },
  openai: {
    name: "OpenAI",
    endpoint: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o-mini",
    buildRequest: (model, messages, apiKey) => ({
      url: "https://api.openai.com/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        max_tokens: 1024,
      }),
    }),
  },
  claude: {
    name: "Claude",
    endpoint: "https://api.anthropic.com/v1/messages",
    model: "claude-haiku-4-5-20251001",
    buildRequest: (model, messages, apiKey) => ({
      url: "https://api.anthropic.com/v1/messages",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        messages: messages.slice(-20),
      }),
    }),
  },
  custom: {
    name: "自定义",
    endpoint: "",
    model: "",
    buildRequest: (model, messages, apiKey) => {
      const endpoint = localStorage.getItem("ai_endpoint") || "https://api.openai.com/v1/chat/completions";
      return {
        url: endpoint,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          max_tokens: 1024,
        }),
      };
    },
  },
};

function getAIProvider(): { provider: AIProviderConfig; apiKey: string; model: string } | null {
  const providerId = localStorage.getItem("ai_provider") || "deepseek";
  const apiKey = localStorage.getItem("ai_api_key") || "";
  const model = localStorage.getItem("ai_model") || "";

  if (!apiKey) return null;

  const provider = PROVIDERS[providerId];
  if (!provider) return null;

  return {
    provider,
    apiKey,
    model: model || provider.model,
  };
}

export async function aiChat(
  messages: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  try {
    // Try server-side proxy first
    const serverUrl = await getServerUrl();
    if (serverUrl) {
      const res = await fetch(`${serverUrl}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.reply) return data.reply;
      }
    }

    // Try direct API call with configured provider
    const config = getAIProvider();
    if (config) {
      const { provider, apiKey, model } = config;
      const { url, headers, body } = provider.buildRequest(model, messages, apiKey);
      const response = await fetch(url, {
        method: "POST",
        headers,
        body,
        signal: AbortSignal.timeout(30000),
      });
      const data = await response.json();
      const text = extractReply(data);
      if (text) return text;
    }

    return getLocalReply(messages[messages.length - 1]?.content || "");
  } catch {
    return getLocalReply(messages[messages.length - 1]?.content || "");
  }
}

function getLocalReply(msg: string): string {
  if (/累|不想学|放弃/.test(msg))
    return "休息一下，先做个最低版本——只学10分钟就好。链不能断哦！💪\n\n（提示：在设置里配置 AI 接口后我能更好地陪你聊）";
  if (/早|早上/.test(msg))
    return "早上好！今天也按计划来吧，先从数学开始 🍅\n\n（提示：在设置里配置 AI 接口后能解锁完整 AI 搭子）";
  if (/难|不会|不懂/.test(msg))
    return "遇到困难说明在成长。试试退一步从基础开始？\n\n（提示：配置 AI 接口后我可以帮你解答具体题目）";
  return "我在呢～有什么想聊的都可以跟我说 🤖\n\n（提示：在设置页面配置 AI 接口，我就能更聪明地陪你备考啦！）";
}
