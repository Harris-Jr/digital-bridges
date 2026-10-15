// Learner help chatbot. Available to signed-in users; grounded in the platform's
// own courses and kept to plain, safe, digital-literacy help.
import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { asyncHandler, badRequest } from "../lib/http.js";
import { requireAuth } from "../middleware.js";
import { aiEnabled, geminiGenerate, type ChatMessage } from "../lib/ai.js";

export const assistantRouter = Router();
assistantRouter.use(requireAuth);

assistantRouter.get(
  "/config",
  asyncHandler(async (_req, res) => {
    res.json({ enabled: aiEnabled() });
  }),
);

const LANG_NAME: Record<string, string> = { en: "English", bem: "Bemba", nya: "Nyanja" };

async function systemPrompt(lang: string): Promise<string> {
  const { rows } = await query<{ title: string; tagline: string; slug: string }>(
    "select title, tagline, slug from courses where is_published = true order by sort_order",
  );
  const courses = rows.map((c) => `- ${c.title}: ${c.tagline}`).join("\n");
  const language = LANG_NAME[lang] ?? "English";
  return `You are the friendly help assistant for Digital Bridges, a free digital-literacy platform for communities in Zambia. You help people learn to use phones safely: mobile money, online safety, scams, WhatsApp, finding work, and basic phone skills.

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
  asyncHandler(async (req, res) => {
    const schema = z.object({
      lang: z.enum(["en", "bem", "nya"]).default("en"),
      messages: z
        .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(2000) }))
        .min(1)
        .max(20),
    });
    const input = schema.safeParse(req.body);
    if (!input.success) throw badRequest("Please send a message.");

    const messages: ChatMessage[] = input.data.messages
      .slice(-12)
      .map((m) => ({ role: m.role === "assistant" ? "model" : "user", text: m.content }));

    const reply = await geminiGenerate({
      system: await systemPrompt(input.data.lang),
      messages,
      temperature: 0.7,
    });
    res.json({ reply });
  }),
);
