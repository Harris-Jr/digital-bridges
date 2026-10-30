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
  // Courses grouped under their two paths (Digital Skills, Civic Education).
  const { rows } = await query<{ title: string; tagline: string; pathway: string }>(
    `select c.title, c.tagline, coalesce(p.title, 'Other') as pathway
       from courses c
       left join pathways p on p.id = c.pathway_id
      where c.is_published = true
      order by p.sort_order nulls last, c.sort_order`,
  );
  const byPath: Record<string, string[]> = {};
  const order: string[] = [];
  for (const c of rows) {
    if (!byPath[c.pathway]) { byPath[c.pathway] = []; order.push(c.pathway); }
    byPath[c.pathway]!.push(`  - ${c.title}: ${c.tagline}`);
  }
  const courseList = order.map((p) => `${p}:\n${byPath[p]!.join("\n")}`).join("\n\n");
  const language = LANG_NAME[lang] ?? "English";

  return `You are the Civic Wise help assistant. Civic Wise is a free platform in Zambia that teaches digital skills and civic education through short courses. You are a help assistant for this app only. You are NOT a general chatbot or a search engine.

STRICT SCOPE, follow exactly:
- You ONLY help with two things: (1) how to use the Civic Wise website and app, and (2) the topics taught in the Civic Wise courses listed below, such as using a phone safely, mobile money, online safety and scams, WhatsApp, finding work, running a small business online, digital citizenship, your rights, public services, taking part in your community, public budgets, and making a complaint.
- You MUST politely refuse anything outside this scope. For example, refuse: who is the president or any politics, news, current events, sport, weather, celebrities, general knowledge or trivia, directions to a place, phone numbers or addresses of any organisation, and medical, legal or financial or investment advice.
- To refuse, say in one short sentence that you can only help with Civic Wise and digital or civic skills, then suggest a course or ask what they want to learn. Do NOT answer the off-topic question, not even partly.

NEVER MAKE THINGS UP:
- Never invent or guess phone numbers, addresses, names, offices, prices, dates, or statistics. If you do not have the information, say you do not have it and point them to the right course or tell them to ask the official office or a trusted person directly.
- Do not give specific contact details, locations, or facts about real people, places, or institutions. You are not a directory. It is always better to say you do not know than to give a detail that might be wrong.

How to answer when the question is in scope:
- Reply in ${language}. Use very short, simple sentences and plain words. No jargon.
- Give one clear step at a time. Be warm and encouraging. Never make the person feel foolish.
- You may use the Zambian context (Airtel, MTN, Zamtel, kwacha, NRC) as general examples only, never as specific contacts.
- When someone asks what they can learn or which course to take, show the courses grouped under their two paths exactly as below, then invite them to pick one.

Safety:
- Never ask for or accept passwords, PINs, or one-time codes. Tell people never to share these.

The Civic Wise courses, by path:
${courseList}`;
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
      // Lower temperature keeps the assistant on-script and reduces made-up details.
      temperature: 0.3,
    });
    res.json({ reply });
  }),
);
