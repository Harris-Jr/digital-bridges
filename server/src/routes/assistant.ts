// Learner help chatbot. Public (no sign-in) so first-time users who need help
// most can reach it, but bounded by IP rate limits, short inputs and a tightly
// scoped prompt. Grounded in the platform's own courses; Gemini with Groq
// fallback. Disabled gracefully when no AI provider is configured.
import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { asyncHandler, badRequest } from "../lib/http.js";
import { aiEnabled, chatGenerate, type ChatMessage } from "../lib/ai.js";
import { rateLimit } from "../lib/ratelimit.js";

export const assistantRouter = Router();

assistantRouter.get(
  "/config",
  asyncHandler(async (_req, res) => {
    res.json({ enabled: aiEnabled() });
  }),
);

// Two layers: a short burst limit and a daily cap, both per IP. Keeps a single
// visitor or a script from running up the AI bill, while leaving normal use free.
const burstLimit = rateLimit({ name: "assistant-burst", max: 6, windowMs: 60_000, message: "You are sending messages too fast. Please wait a moment." });
const dailyLimit = rateLimit({ name: "assistant-daily", max: 80, windowMs: 24 * 60 * 60_000, message: "You have reached today's help limit. Please try again tomorrow." });

const LANG_NAME: Record<string, string> = { en: "English", bem: "Bemba", nya: "Nyanja" };

async function systemPrompt(lang: string): Promise<string> {
  const { rows } = await query<{ title: string; tagline: string; slug: string }>(
    "select title, tagline, slug from courses where is_published = true order by sort_order",
  );
  const courses = rows.map((c) => `- ${c.title}: ${c.tagline}`).join("\n");
  const language = LANG_NAME[lang] ?? "English";
  return `You are the friendly help assistant for Civic Wise, a free digital-literacy platform for communities in Zambia. You help people learn to use phones safely: mobile money, online safety, scams, WhatsApp, finding work, and basic phone skills.

How to answer:
- Reply in ${language}. Use very short, simple sentences and plain words. No jargon.
- Keep answers brief — a few sentences. Give one clear step at a time.
- Use the Zambian context (Airtel, MTN, Zamtel, kwacha, NRC) when it fits.
- When useful, point the person to the right course from this list:
${courses}
- Be warm and encouraging. Never make the person feel foolish.

Safety:
- Never ask for or accept passwords, PINs, or one-time codes. Tell people never to share these.
- Do not give medical, legal, or money-investment advice. For those, suggest talking to a trusted professional or local service.
- If asked something unrelated or harmful, gently bring the conversation back to digital skills and safety.`;
}

assistantRouter.post(
  "/chat",
  burstLimit,
  dailyLimit,
  asyncHandler(async (req, res) => {
    // Short inputs and a small history cap bound the token cost per call.
    const schema = z.object({
      lang: z.enum(["en", "bem", "nya"]).default("en"),
      messages: z
        .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(800) }))
        .min(1)
        .max(16),
    });
    const input = schema.safeParse(req.body);
    if (!input.success) throw badRequest("Please send a short message.");

    const messages: ChatMessage[] = input.data.messages
      .slice(-8)
      .map((m) => ({ role: m.role === "assistant" ? "model" : "user", text: m.content }));

    const reply = await chatGenerate({
      system: await systemPrompt(input.data.lang),
      messages,
      temperature: 0.7,
    });
    res.json({ reply });
  }),
);
