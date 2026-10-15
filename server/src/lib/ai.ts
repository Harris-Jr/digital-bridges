// Thin Google Gemini client (REST). Provider-agnostic shape so another backend
// could be swapped in. Disabled gracefully when GEMINI_API_KEY is unset.
import { env } from "../env.js";
import { HttpError } from "./http.js";

export function aiEnabled(): boolean {
  return !!env.GEMINI_API_KEY;
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

/** Parse a JSON array from a model reply, tolerating code fences. */
export function parseJsonArray<T>(text: string): T[] {
  const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) throw new HttpError(502, "AI did not return a list.");
  return parsed as T[];
}
