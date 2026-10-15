// Staff AI helpers: draft quiz questions from a lesson's content.
import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { asyncHandler, badRequest, notFound } from "../lib/http.js";
import { requireAuth, requireStaff } from "../middleware.js";
import { aiEnabled, geminiGenerate, parseJsonArray } from "../lib/ai.js";

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
${lesson.body_richtext || "(no body text — write general questions on the title topic)"}

Write ${input.data.count} quiz questions as a JSON array.`;

    const raw = await geminiGenerate({ system: SYSTEM, messages: [{ role: "user", text: prompt }], json: true, temperature: 0.5 });
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
