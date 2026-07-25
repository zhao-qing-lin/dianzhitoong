import OpenAI from "openai";

export function hasLlm() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;
  return new OpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  });
}

type ChatMessage = {
  content?: string | null;
  reasoning_content?: string | null;
};

export async function chatJson<T>(system: string, user: string): Promise<T | null> {
  const client = getOpenAI();
  if (!client) return null;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const isDeepSeek = (process.env.OPENAI_BASE_URL || "").includes("deepseek");

  const payload: Record<string, unknown> = {
    model,
    temperature: 0.4,
    max_tokens: 2048,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    response_format: { type: "json_object" },
  };
  // DeepSeek V4：关闭 thinking，确保 content 直接返回 JSON
  if (isDeepSeek) {
    payload.thinking = { type: "disabled" };
  }

  const res = (await client.chat.completions.create(
    payload as never,
  )) as { choices: { message: ChatMessage }[] };

  const message = res.choices[0]?.message;
  const text = (message?.content || message?.reasoning_content || "").trim();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return null;
    return JSON.parse(m[0]) as T;
  }
}
