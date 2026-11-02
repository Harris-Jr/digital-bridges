// Staff AI helpers: draft quiz questions from a lesson's content.
import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { asyncHandler, badRequest, notFound } from "../lib/http.js";
import { requireAuth, requireStaff } from "../middleware.js";
import { aiEnabled, chatGenerate, parseJsonArray } from "../lib/ai.js";

export const aiAdminRouter = Router();
aiAdminRouter.use(requireAuth, requireStaff);

aiAdminRouter.get(
  "/config",
  asyncHandler(async (_req, res) => {
    res.json({ enabled: aiEnabled() });
  }),
);

type DraftQuestion = { question: string; options: string[]; correct_index: number; explanation: string };

const SYSTEM = `You write simple multiple-choice quiz questions for a digital-literacy course aimed at adults in Zambia who may have low reading levels and little experience with phones. Rules:
- Use very plain, short sentences. Avoid jargon.
- Each question has exactly 4 answer options, with one clearly correct answer.
- Base every question only on the lesson text provided.
- Keep the Zambian context (mobile money, Airtel/MTN/Zamtel, WhatsApp, local examples) where the lesson uses it.
- The explanation says, in one or two short sentences, why the correct answer is right.
Return ONLY a JSON array, no prose, shaped like:
[{"question": "...", "options": ["...","...","...","..."], "correct_index": 0, "explanation": "..."}]`;

aiAdminRouter.post(
  "/quiz-from-lesson",
  asyncHandler(async (req, res) => {
    const schema = z.object({ lesson_id: z.string().uuid(), count: z.coerce.number().int().min(1).max(8).default(4) });
    const input = schema.safeParse(req.body);
    if (!input.success) throw badRequest("A valid lesson is required.");

    const { rows } = await query<{ title: string; body_richtext: string }>(
      "select title, body_richtext from lessons where id = $1",
      [input.data.lesson_id],
    );
    const lesson = rows[0];
    if (!lesson) throw notFound("Lesson not found");

    const prompt = `Lesson title: ${lesson.title}

Lesson text:
${lesson.body_richtext || "(no body text, write general questions on the title topic)"}

Write ${input.data.count} quiz questions as a JSON array.`;

    const raw = await chatGenerate({ system: SYSTEM, messages: [{ role: "user", text: prompt }], json: true, temperature: 0.5 });
    const drafts = parseJsonArray<DraftQuestion>(raw)
      .filter((q) => q && typeof q.question === "string" && Array.isArray(q.options) && q.options.length >= 2)
      .map((q) => ({
        question: String(q.question).trim(),
        options: q.options.map((o) => String(o).trim()).filter(Boolean).slice(0, 4),
        correct_index: Math.min(Math.max(Number(q.correct_index) || 0, 0), 3),
        explanation: String(q.explanation ?? "").trim(),
      }))
      .filter((q) => q.options.length >= 2);

    res.json(drafts);
  }),
);

// ---------------------------------------------------------------------------
// Lesson writing helper: draft a new lesson from a title (and optional notes),
// or rewrite an existing body to be simpler / shorter / more practical.
// Output follows the beginner guideline used across Civic Wise: one idea per
// lesson, 150 to 300 words, short sentences, Zambian examples.
// ---------------------------------------------------------------------------
type LessonDraft = { body_richtext: string; key_points: string[]; try_it_action: string };

const LESSON_SYSTEM = `You write short lessons for Civic Wise, a free learning app for adults in Zambia. Many learners are new to smartphones, read slowly, and use English as a second language. Rules:
- One idea per lesson. 150 to 300 words. Never more than 350.
- Short sentences (under 15 words). Everyday words. Explain any technical word the first time.
- Talk to the learner as "you". Warm and respectful, never childish.
- Use Zambian examples where they fit: Airtel Money, MTN MoMo, Zamtel, WhatsApp, ZESCO tokens, council offices, NRC, markets, kwacha (K).
- Give steps as a list when the learner must do something.
- Format: plain text. Use "## " for 1 to 3 short sub-headings, "- " for list items, "**word**" for bold. Blank line between blocks. No other markdown, no tables, no links.
- Never invent phone numbers, addresses, prices, laws or statistics.
Return ONLY a JSON object, no prose:
{"body_richtext": "...", "key_points": ["3 short points to remember"], "try_it_action": "one small safe practice task the learner can do now"}`;

aiAdminRouter.post(
  "/lesson-write",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      mode: z.enum(["draft", "simplify", "shorten", "examples"]),
      title: z.string().trim().min(2).max(200),
      course_title: z.string().trim().max(200).default(""),
      notes: z.string().trim().max(2000).default(""),
      body: z.string().max(20000).default(""),
    });
    const input = schema.safeParse(req.body);
    if (!input.success) throw badRequest("Give the lesson a title first.");
    const { mode, title, course_title, notes, body } = input.data;

    const task = {
      draft: `Write a new lesson.${notes ? `\nThe editor's notes on what to cover:\n${notes}` : ""}`,
      simplify: `Rewrite this lesson in simpler words and shorter sentences. Keep every fact. Keep it under 300 words.\n\nCurrent lesson:\n${body}`,
      shorten: `Shorten this lesson to about 200 words. Keep the most useful steps and facts.\n\nCurrent lesson:\n${body}`,
      examples: `Rewrite this lesson adding one or two everyday Zambian examples that make it concrete. Stay under 300 words.\n\nCurrent lesson:\n${body}`,
    }[mode];

    const prompt = `Course: ${course_title || "(not given)"}\nLesson title: ${title}\n\n${task}`;
    const raw = await chatGenerate({ system: LESSON_SYSTEM, messages: [{ role: "user", text: prompt }], json: true, temperature: 0.5 });
    let parsed: Partial<LessonDraft>;
    try {
      parsed = JSON.parse(raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim()) as Partial<LessonDraft>;
    } catch {
      throw badRequest("The AI reply could not be read. Try again.");
    }
    res.json({
      body_richtext: String(parsed.body_richtext ?? "").trim(),
      key_points: Array.isArray(parsed.key_points) ? parsed.key_points.map((k) => String(k).trim()).filter(Boolean).slice(0, 5) : [],
      try_it_action: String(parsed.try_it_action ?? "").trim(),
    } satisfies LessonDraft);
  }),
);
