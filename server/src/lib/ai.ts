// AI clients (REST). Google Gemini is the primary backend; Groq (OpenAI-
// compatible) is the fallback. Both are optional: when neither key is set the
// assistant is disabled gracefully and the UI shows a plain help link instead.
import { env } from "../env.js";
import { HttpError } from "./http.js";

export function geminiEnabled(): boolean {
  return !!env.GEMINI_API_KEY;
}
export function groqEnabled(): boolean {
  return !!env.GROQ_API_KEY;
}
/** AI features are available if at least one provider is configured. */
export function aiEnabled(): boolean {
  return geminiEnabled() || groqEnabled();
}

export type ChatMessage = { role: "user" | "model"; text: string };

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  error?: { message?: string };
};

/**
 * Generate text from Gemini. `system` sets the behaviour, `messages` is the
 * conversation so far, `json` asks the model to return application/json.
 */
export async function geminiGenerate(opts: {
  system?: string;
  messages: ChatMessage[];
  json?: boolean;
  temperature?: number;
}): Promise<string> {
  if (!env.GEMINI_API_KEY) throw new HttpError(503, "AI is not configured.");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;
  const body: Record<string, unknown> = {
    contents: opts.messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
    generationConfig: {
      temperature: opts.temperature ?? 0.6,
      ...(opts.json ? { responseMimeType: "application/json" } : {}),
    },
  };
  if (opts.system) body["system_instruction"] = { parts: [{ text: opts.system }] };

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    throw new HttpError(504, "The AI service did not respond. Please try again.");
  }

  const data = (await res.json().catch(() => ({}))) as GeminiResponse;
  if (!res.ok) throw new HttpError(502, data.error?.message ?? "AI request failed.");

  const text = (data.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? "").join("").trim();
  if (!text) throw new HttpError(502, "The AI returned an empty response.");
  return text;
}

type GroqResponse = {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
};

/** Generate text from Groq (OpenAI-compatible chat completions). */
export async function groqGenerate(opts: {
  system?: string;
  messages: ChatMessage[];
  json?: boolean;
  temperature?: number;
}): Promise<string> {
  if (!env.GROQ_API_KEY) throw new HttpError(503, "AI is not configured.");

  const msgs: { role: string; content: string }[] = [];
  if (opts.system) msgs.push({ role: "system", content: opts.system });
  for (const m of opts.messages) msgs.push({ role: m.role === "model" ? "assistant" : "user", content: m.text });

  let res: Response;
  try {
    res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: env.GROQ_MODEL,
        messages: msgs,
        temperature: opts.temperature ?? 0.6,
        ...(opts.json ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    throw new HttpError(504, "The AI service did not respond. Please try again.");
  }

  const data = (await res.json().catch(() => ({}))) as GroqResponse;
  if (!res.ok) throw new HttpError(502, data.error?.message ?? "AI request failed.");
  const text = (data.choices?.[0]?.message?.content ?? "").trim();
  if (!text) throw new HttpError(502, "The AI returned an empty response.");
  return text;
}

/**
 * Generate using Gemini first, falling back to Groq if Gemini is unset or
 * fails. Throws only when no provider is configured or all providers fail.
 */
export async function chatGenerate(opts: {
  system?: string;
  messages: ChatMessage[];
  json?: boolean;
  temperature?: number;
}): Promise<string> {
  if (env.GEMINI_API_KEY) {
    try {
      return await geminiGenerate(opts);
    } catch (err) {
      if (!env.GROQ_API_KEY) throw err;
      console.warn("[ai] Gemini failed, falling back to Groq:", err instanceof Error ? err.message : err);
    }
  }
  if (env.GROQ_API_KEY) return groqGenerate(opts);
  throw new HttpError(503, "AI is not configured.");
}

/** Parse a JSON array from a model reply, tolerating code fences. */
export function parseJsonArray<T>(text: string): T[] {
  const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) throw new HttpError(502, "AI did not return a list.");
  return parsed as T[];
}
