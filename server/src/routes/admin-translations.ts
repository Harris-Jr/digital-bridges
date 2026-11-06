// Staff translation workspace (phase 7).
//
// English rows in the base tables are the source of truth. Bemba and Nyanja
// live in content_translations, one row per field, each with a status:
//   draft     an AI suggestion, not shown to learners yet
//   approved  checked by a person (or typed by one), shown to learners
// source_hash records which English text a translation was made from, so the
// editor can flag translations whose English has changed since.
import { Router } from "express";
import { createHash } from "node:crypto";
import { z } from "zod";
import { query } from "../db.js";
import { asyncHandler, badRequest, HttpError, notFound } from "../lib/http.js";
import { aiEnabled, chatGenerate } from "../lib/ai.js";
import { requireAuth, requireStaff } from "../middleware.js";

export const adminTranslationsRouter = Router();
adminTranslationsRouter.use(requireAuth, requireStaff);

const LANGS = ["bem", "nya"] as const;
type Lang = (typeof LANGS)[number];
const LANG_NAME: Record<Lang, string> = {
  bem: "Bemba (Icibemba) as spoken in Zambia",
  nya: "Nyanja (Chinyanja) as spoken in Zambia, especially Lusaka and Eastern Province",
};

/* ------------------------------------------------------------------ fields */

type FieldType = "text" | "longtext" | "list";
type FieldSpec = { name: string; type: FieldType; label: string };
type EntityType = "course" | "module" | "lesson" | "quiz_question" | "scenario_step";

const SPECS: Record<EntityType, { table: string; label: string; fields: FieldSpec[] }> = {
  course: { table: "courses", label: "Course", fields: [
    { name: "title", type: "text", label: "Title" },
    { name: "tagline", type: "text", label: "Tagline" },
    { name: "description", type: "longtext", label: "Description" },
    { name: "outcomes", type: "list", label: "What you will be able to do" },
  ] },
  module: { table: "modules", label: "Module", fields: [
    { name: "title", type: "text", label: "Title" },
    { name: "summary", type: "longtext", label: "Summary" },
  ] },
  lesson: { table: "lessons", label: "Lesson", fields: [
    { name: "title", type: "text", label: "Title" },
    { name: "body_richtext", type: "longtext", label: "Lesson text" },
    { name: "key_points", type: "list", label: "Remember (key points)" },
    { name: "try_it_action", type: "text", label: "Try it yourself" },
  ] },
  quiz_question: { table: "quiz_questions", label: "Quiz question", fields: [
    { name: "question", type: "text", label: "Question" },
    { name: "options", type: "list", label: "Answers" },
    { name: "explanation", type: "longtext", label: "Explanation" },
  ] },
  scenario_step: { table: "scenario_steps", label: "Scenario step", fields: [
    { name: "prompt", type: "longtext", label: "Situation" },
    { name: "options", type: "list", label: "Choices" },
    { name: "feedback", type: "list", label: "Feedback for each choice" },
  ] },
};
const ENTITY_TYPES = Object.keys(SPECS) as EntityType[];

type Value = string | string[];
const isEmpty = (v: unknown) => (Array.isArray(v) ? v.every((x) => !String(x ?? "").trim()) : !String(v ?? "").trim());
const hashOf = (v: unknown) => createHash("md5").update(JSON.stringify(v ?? "")).digest("hex");

type TrRow = { entity_type: string; entity_id: string; lang: string; field: string; value: Value; status: "approved" | "draft"; origin: "human" | "ai"; source_hash: string | null; updated_at: string };
type Unit = {
  entityType: EntityType;
  entityId: string;
  label: string;
  fields: FieldSpec[];
  source: Record<string, Value>;
  translations: Record<Lang, Record<string, { value: Value; status: string; origin: string; stale: boolean; updated_at: string }>>;
};

/** Load units (English + translations) for one entity type and a set of ids. */
async function loadUnits(type: EntityType, ids: string[], label: (row: Record<string, unknown>, i: number) => string): Promise<Unit[]> {
  if (!ids.length) return [];
  const spec = SPECS[type];
  const cols = spec.fields.map((f) => f.name).join(", ");
  const { rows } = await query<Record<string, unknown>>(`select id, ${cols} from ${spec.table} where id = any($1::uuid[])`, [ids]);
  const byId = new Map(rows.map((r) => [String(r.id), r]));
  const { rows: trs } = await query<TrRow>(
    "select * from content_translations where entity_type = $1 and entity_id = any($2::uuid[])",
    [type, ids],
  );
  return ids.filter((id) => byId.has(id)).map((id, i) => {
    const row = byId.get(id)!;
    const source: Record<string, Value> = {};
    for (const f of spec.fields) source[f.name] = (row[f.name] ?? (f.type === "list" ? [] : "")) as Value;
    const translations = { bem: {}, nya: {} } as Unit["translations"];
    for (const t of trs.filter((x) => x.entity_id === id)) {
      const l = t.lang as Lang;
      if (!translations[l] || !(t.field in source)) continue;
      translations[l][t.field] = {
        value: t.value, status: t.status, origin: t.origin, updated_at: t.updated_at,
        stale: !!t.source_hash && t.source_hash !== hashOf(source[t.field]),
      };
    }
    return { entityType: type, entityId: id, label: label(row, i), fields: spec.fields, source, translations };
  });
}

async function saveField(type: EntityType, id: string, lang: Lang, field: string, value: Value, source: Value, opts: { status: "approved" | "draft"; origin: "human" | "ai"; userId?: string }) {
  await query(
    `insert into content_translations (entity_type, entity_id, lang, field, value, status, origin, source_hash, reviewed_by)
       values ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9)
     on conflict (entity_type, entity_id, lang, field) do update
       set value = excluded.value, status = excluded.status, origin = excluded.origin,
           source_hash = excluded.source_hash, reviewed_by = excluded.reviewed_by, updated_at = now()`,
    [type, id, lang, field, JSON.stringify(value), opts.status, opts.origin, hashOf(source), opts.status === "approved" ? opts.userId ?? null : null],
  );
}

/* ---------------------------------------------------------------- AI drafts */

type Job = { key: string; value: Value; type: FieldType };

async function glossaryFor(lang: Lang): Promise<string> {
  const { rows } = await query<{ term: string; bem: string; nya: string; note: string }>("select term, bem, nya, note from translation_glossary order by term");
  const lines = rows.filter((r) => r[lang].trim()).map((r) => `- "${r.term}" -> "${r[lang]}"${r.note ? ` (${r.note})` : ""}`);
  return lines.length ? `\nAlways use these agreed terms:\n${lines.join("\n")}\n` : "";
}

const urlsIn = (s: string) => s.match(/\]\(([^)\s]+)\)/g) ?? [];

/** Ask the AI to translate a set of fields. Returns only the results that pass checks. */
async function aiTranslate(lang: Lang, jobs: Job[]): Promise<Map<string, Value>> {
  const out = new Map<string, Value>();
  if (!jobs.length) return out;
  const glossary = await glossaryFor(lang);
  const system = `You translate short lessons from a free Zambian learning website into ${LANG_NAME[lang]}.
The readers are adults who may be new to phones and the internet, so use plain, everyday words as people really speak them.
Rules:
- Keep the meaning exact. Do not add, remove or explain anything.
- Keep all formatting exactly as it is: lines starting with "## ", "- " or "1. ", **bold**, *italic*, blank lines between paragraphs.
- In links like [text](https://...) translate only the text in square brackets. Never change a URL.
- Never change numbers, amounts (K500), phone numbers, short codes (*707#, *#06#, \\*707#), email addresses or website addresses.
- Keep brand and organisation names as they are: Airtel, MTN, Zamtel, ZICTA, WhatsApp, Facebook, Google, Bank of Zambia, PACRA.
- Everyday English loanwords that people use in speech (phone, SIM, PIN, data, app, link, password) may stay in English.
- For a list (JSON array), return a list with exactly the same number of items, in the same order.${glossary}
Return a JSON object with exactly the same keys as the input, each holding the translation.`;

  // Keep each request a reasonable size.
  const batches: Job[][] = [];
  let cur: Job[] = [];
  let size = 0;
  for (const j of jobs) {
    const n = JSON.stringify(j.value).length;
    if (cur.length && size + n > 6000) { batches.push(cur); cur = []; size = 0; }
    cur.push(j); size += n;
  }
  if (cur.length) batches.push(cur);

  for (const batch of batches) {
    const input = Object.fromEntries(batch.map((j) => [j.key, j.value]));
    const text = await chatGenerate({ system, json: true, temperature: 0.2, messages: [{ role: "user", text: JSON.stringify(input, null, 1) }] });
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim());
    } catch {
      continue; // a broken reply just leaves these fields untranslated
    }
    for (const j of batch) {
      const v = parsed?.[j.key];
      if (j.type === "list") {
        if (!Array.isArray(v) || !Array.isArray(j.value) || v.length !== j.value.length || v.some((x) => typeof x !== "string" || !x.trim())) continue;
        out.set(j.key, v.map((x) => String(x).trim()));
      } else {
        if (typeof v !== "string" || !v.trim()) continue;
        // Every link in the English must survive unchanged.
        const src = String(j.value);
        if (urlsIn(src).some((u) => !v.includes(u))) continue;
        out.set(j.key, v.trim());
      }
    }
  }
  return out;
}

/**
 * Draft translations for units. By default only fields with no translation
 * yet; with `redo` also fields whose English changed. Approved human work is
 * never overwritten unless `overwrite` is set.
 */
async function draftUnits(lang: Lang, units: Unit[], opts: { fields?: string[]; redo?: boolean; overwrite?: boolean } = {}) {
  const jobs: Job[] = [];
  for (const u of units) {
    for (const f of u.fields) {
      if (opts.fields && !opts.fields.includes(f.name)) continue;
      const src = u.source[f.name];
      if (isEmpty(src)) continue;
      const tr = u.translations[lang][f.name];
      const want = !tr || opts.overwrite || (opts.redo && tr.stale) || (tr.status === "draft" && !!opts.fields);
      if (!want) continue;
      jobs.push({ key: `${u.entityType}|${u.entityId}|${f.name}`, value: src!, type: f.type });
    }
  }
  const results = await aiTranslate(lang, jobs);
  for (const [key, value] of results) {
    const [type, id, field] = key.split("|") as [EntityType, string, string];
    const unit = units.find((u) => u.entityType === type && u.entityId === id)!;
    await saveField(type, id, lang, field, value, unit.source[field]!, { status: "draft", origin: "ai" });
  }
  return { asked: jobs.length, written: results.size, failed: jobs.length - results.size };
}

/* ------------------------------------------------------------ course tree */

type Tree = {
  course: { id: string; title: string; slug: string };
  modules: { id: string; title: string }[];
  lessons: { id: string; title: string; module_id: string | null; type: string }[];
  quiz: { id: string; lesson_id: string }[];
  scenario: { id: string; lesson_id: string }[];
};

async function courseTree(courseId: string): Promise<Tree> {
  const { rows: [course] } = await query<Tree["course"]>("select id, title, slug from courses where id = $1", [courseId]);
  if (!course) throw notFound("Course not found.");
  const { rows: modules } = await query<Tree["modules"][number]>("select id, title from modules where course_id = $1 order by sort_order", [courseId]);
  const { rows: lessons } = await query<Tree["lessons"][number]>("select id, title, module_id, type from lessons where course_id = $1 order by sort_order", [courseId]);
  const ids = lessons.map((l) => l.id);
  const { rows: quiz } = await query<Tree["quiz"][number]>("select id, lesson_id from quiz_questions where lesson_id = any($1::uuid[]) order by sort_order", [ids]);
  const { rows: scenario } = await query<Tree["scenario"][number]>("select id, lesson_id from scenario_steps where lesson_id = any($1::uuid[]) order by sort_order", [ids]);
  return { course, modules, lessons, quiz, scenario };
}

/** Every unit in a course: the course, its modules, lessons, quiz questions and scenario steps. */
async function courseUnits(tree: Tree): Promise<Unit[]> {
  return [
    ...(await loadUnits("course", [tree.course.id], () => "Course")),
    ...(await loadUnits("module", tree.modules.map((m) => m.id), (_r, i) => `Module ${i + 1}`)),
    ...(await loadUnits("lesson", tree.lessons.map((l) => l.id), (r) => String(r.title))),
    ...(await loadUnits("quiz_question", tree.quiz.map((q) => q.id), (_r, i) => `Question ${i + 1}`)),
    ...(await loadUnits("scenario_step", tree.scenario.map((s) => s.id), (_r, i) => `Step ${i + 1}`)),
  ];
}

type Counts = { total: number; approved: number; draft: number; stale: number; missing: number };
function count(units: Unit[], lang: Lang): Counts {
  const c: Counts = { total: 0, approved: 0, draft: 0, stale: 0, missing: 0 };
  for (const u of units) for (const f of u.fields) {
    if (isEmpty(u.source[f.name])) continue;
    c.total += 1;
    const t = u.translations[lang][f.name];
    if (!t) c.missing += 1;
    else if (t.stale) c.stale += 1;
    else if (t.status === "draft") c.draft += 1;
    else c.approved += 1;
  }
  return c;
}

/* ------------------------------------------------------------------ routes */

const langParam = (v: unknown): Lang => {
  if (v === "bem" || v === "nya") return v;
  throw badRequest("Choose Bemba (bem) or Nyanja (nya).");
};

// Overview: every course with how much of it is translated.
adminTranslationsRouter.get(
  "/overview",
  asyncHandler(async (req, res) => {
    const lang = langParam(req.query.lang);
    const { rows: courses } = await query<{ id: string }>("select id from courses order by sort_order");
    const out = [];
    for (const c of courses) {
      const tree = await courseTree(c.id);
      const units = await courseUnits(tree);
      // Per lesson (with its quiz and scenario) and per module: a status for the list.
      const status: Record<string, "done" | "review" | "todo" | "changed"> = {};
      const st = (us: Unit[]) => { const n = count(us, lang); return n.stale ? "changed" : n.missing ? "todo" : n.draft ? "review" : "done"; };
      status[`course:${tree.course.id}`] = st(units.filter((u) => u.entityType === "course" || u.entityType === "module"));
      for (const l of tree.lessons) {
        const childIds = new Set([...tree.quiz, ...tree.scenario].filter((x) => x.lesson_id === l.id).map((x) => x.id));
        status[`lesson:${l.id}`] = st(units.filter((u) => u.entityId === l.id || childIds.has(u.entityId)));
      }
      out.push({
        id: tree.course.id, slug: tree.course.slug, title: tree.course.title,
        counts: count(units, lang),
        lessons: tree.lessons.map((l) => ({ id: l.id, title: l.title, type: l.type, module_id: l.module_id })),
        modules: tree.modules,
        status,
      });
    }
    res.json({ aiEnabled: aiEnabled(), courses: out, job: currentJob(lang) });
  }),
);

// One screen of work: the course (with its modules), or a lesson (with its quiz and scenario).
adminTranslationsRouter.get(
  "/unit/:kind/:id",
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    if (req.params.kind === "course") {
      const tree = await courseTree(id);
      res.json([
        ...(await loadUnits("course", [id], () => "Course")),
        ...(await loadUnits("module", tree.modules.map((m) => m.id), (_r, i) => `Module ${i + 1}`)),
      ]);
      return;
    }
    if (req.params.kind !== "lesson") throw notFound("Unknown screen.");
    const { rows: q } = await query<{ id: string }>("select id from quiz_questions where lesson_id = $1 order by sort_order", [id]);
    const { rows: s } = await query<{ id: string }>("select id from scenario_steps where lesson_id = $1 order by sort_order", [id]);
    const lesson = await loadUnits("lesson", [id], () => "Lesson");
    if (!lesson.length) throw notFound("Lesson not found.");
    res.json([
      ...lesson,
      ...(await loadUnits("quiz_question", q.map((r) => r.id), (_r, i) => `Question ${i + 1}`)),
      ...(await loadUnits("scenario_step", s.map((r) => r.id), (_r, i) => `Step ${i + 1}`)),
    ]);
  }),
);

const unitRef = z.object({ entityType: z.enum(ENTITY_TYPES as [EntityType, ...EntityType[]]), entityId: z.string().uuid() });

// Save typed translations. What a person saves is approved.
adminTranslationsRouter.put(
  "/save",
  asyncHandler(async (req, res) => {
    const input = z.object({
      lang: z.enum(LANGS),
      units: z.array(unitRef.extend({ fields: z.record(z.string(), z.union([z.string(), z.array(z.string())])) })).max(100),
    }).safeParse(req.body);
    if (!input.success) throw badRequest("Invalid translation payload.");
    const { lang, units } = input.data;
    for (const u of units) {
      const [unit] = await loadUnits(u.entityType, [u.entityId], () => "");
      if (!unit) continue;
      for (const [field, raw] of Object.entries(u.fields)) {
        const spec = unit.fields.find((f) => f.name === field);
        if (!spec) continue;
        const value: Value = spec.type === "list"
          ? (Array.isArray(raw) ? raw : [raw]).map((x) => String(x).trim())
          : (Array.isArray(raw) ? raw.join(" ") : raw).trim();
        if (isEmpty(value)) {
          await query("delete from content_translations where entity_type = $1 and entity_id = $2 and lang = $3 and field = $4", [u.entityType, u.entityId, lang, field]);
          continue;
        }
        const existing = unit.translations[lang][field];
        // Unchanged AI draft saved as-is stays a draft; any edit is a person's work.
        const untouchedDraft = existing?.status === "draft" && JSON.stringify(existing.value) === JSON.stringify(value);
        if (untouchedDraft) continue;
        await saveField(u.entityType, u.entityId, lang, field, value, unit.source[field]!, { status: "approved", origin: existing?.origin === "ai" ? "ai" : "human", userId: req.auth!.id });
      }
    }
    res.json({ ok: true });
  }),
);

// Approve drafts (or confirm translations whose English changed).
adminTranslationsRouter.post(
  "/approve",
  asyncHandler(async (req, res) => {
    const input = z.object({
      lang: z.enum(LANGS),
      units: z.array(unitRef.extend({ fields: z.array(z.string()).optional() })).max(500),
    }).safeParse(req.body);
    if (!input.success) throw badRequest("Invalid approval.");
    let n = 0;
    for (const u of input.data.units) {
      const [unit] = await loadUnits(u.entityType, [u.entityId], () => "");
      if (!unit) continue;
      for (const f of unit.fields) {
        if (u.fields && !u.fields.includes(f.name)) continue;
        const tr = unit.translations[input.data.lang][f.name];
        if (!tr || (tr.status === "approved" && !tr.stale)) continue;
        await saveField(u.entityType, u.entityId, input.data.lang, f.name, tr.value, unit.source[f.name]!, { status: "approved", origin: tr.origin as "human" | "ai", userId: req.auth!.id });
        n += 1;
      }
    }
    res.json({ approved: n });
  }),
);

// AI drafts for specific units and fields (the "Suggest" buttons).
adminTranslationsRouter.post(
  "/suggest",
  asyncHandler(async (req, res) => {
    if (!aiEnabled()) throw new HttpError(503, "AI is not set up. Add a Gemini or Groq key to the server settings.");
    const input = z.object({
      lang: z.enum(LANGS),
      units: z.array(unitRef).min(1).max(40),
      fields: z.array(z.string()).optional(),
      overwrite: z.boolean().optional(),
    }).safeParse(req.body);
    if (!input.success) throw badRequest("Invalid request.");
    const units: Unit[] = [];
    for (const u of input.data.units) units.push(...(await loadUnits(u.entityType, [u.entityId], () => "")));
    const r = await draftUnits(input.data.lang, units, { fields: input.data.fields, overwrite: input.data.overwrite, redo: true });
    res.json(r);
  }),
);

/* ---------------------------------------------- whole-course background job */

type CourseJob = { id: string; lang: Lang; courseId: string; courseTitle: string; status: "running" | "done" | "failed"; done: number; total: number; written: number; failed: number; error?: string; startedAt: string };
const jobs = new Map<string, CourseJob>();
const currentJob = (lang: Lang) => [...jobs.values()].filter((j) => j.lang === lang).sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0] ?? null;

adminTranslationsRouter.post(
  "/jobs",
  asyncHandler(async (req, res) => {
    if (!aiEnabled()) throw new HttpError(503, "AI is not set up. Add a Gemini or Groq key to the server settings.");
    const input = z.object({ lang: z.enum(LANGS), courseId: z.string().uuid(), redo: z.boolean().optional() }).safeParse(req.body);
    if (!input.success) throw badRequest("Invalid request.");
    const { lang, courseId, redo } = input.data;
    if ([...jobs.values()].some((j) => j.status === "running")) throw new HttpError(409, "A translation job is already running. Wait for it to finish.");
    const tree = await courseTree(courseId);
    const units = await courseUnits(tree);
    // One step per lesson (with its quiz and scenario), plus the course and modules.
    const groups: Unit[][] = [units.filter((u) => u.entityType === "course" || u.entityType === "module")];
    for (const l of tree.lessons) {
      const childIds = new Set([...tree.quiz, ...tree.scenario].filter((x) => x.lesson_id === l.id).map((x) => x.id));
      groups.push(units.filter((u) => u.entityId === l.id || childIds.has(u.entityId)));
    }
    const job: CourseJob = { id: crypto.randomUUID(), lang, courseId, courseTitle: tree.course.title, status: "running", done: 0, total: groups.length, written: 0, failed: 0, startedAt: new Date().toISOString() };
    jobs.set(job.id, job);
    void (async () => {
      try {
        let errors = 0;
        for (const g of groups) {
          try {
            const r = await draftUnits(lang, g, { redo });
            job.written += r.written;
            job.failed += r.failed;
          } catch (err) {
            // One part failing (a rate limit, a timeout) should not stop the rest.
            errors += 1;
            job.error = err instanceof Error ? err.message : "The AI did not answer.";
            if (errors >= 3 && job.written === 0) throw err;
          }
          job.done += 1;
          // A short pause keeps us under free-tier AI rate limits.
          await new Promise((r) => setTimeout(r, 1500));
        }
        job.status = "done";
      } catch (err) {
        job.status = "failed";
        job.error = err instanceof Error ? err.message : "The AI stopped responding.";
      }
    })();
    res.status(202).json(job);
  }),
);

adminTranslationsRouter.get(
  "/jobs/:id",
  asyncHandler(async (req, res) => {
    const job = jobs.get(String(req.params.id));
    if (!job) throw notFound("Job not found. The server may have restarted.");
    res.json(job);
  }),
);

/* ---------------------------------------------------------------- glossary */

const glossaryInput = z.object({
  term: z.string().trim().min(1).max(120),
  bem: z.string().trim().max(200).default(""),
  nya: z.string().trim().max(200).default(""),
  note: z.string().trim().max(300).default(""),
});

adminTranslationsRouter.get(
  "/glossary",
  asyncHandler(async (_req, res) => {
    const { rows } = await query("select id, term, bem, nya, note, updated_at from translation_glossary order by lower(term)");
    res.json(rows);
  }),
);

adminTranslationsRouter.post(
  "/glossary",
  asyncHandler(async (req, res) => {
    const input = glossaryInput.safeParse(req.body);
    if (!input.success) throw badRequest("Type the English word or phrase.");
    const { term, bem, nya, note } = input.data;
    const { rows } = await query(
      `insert into translation_glossary (term, bem, nya, note) values ($1, $2, $3, $4)
       on conflict (term) do update set bem = excluded.bem, nya = excluded.nya, note = excluded.note, updated_at = now()
       returning id, term, bem, nya, note, updated_at`,
      [term, bem, nya, note],
    );
    res.status(201).json(rows[0]);
  }),
);

adminTranslationsRouter.patch(
  "/glossary/:id",
  asyncHandler(async (req, res) => {
    const input = glossaryInput.safeParse(req.body);
    if (!input.success) throw badRequest("Type the English word or phrase.");
    const { term, bem, nya, note } = input.data;
    const { rows } = await query(
      "update translation_glossary set term = $2, bem = $3, nya = $4, note = $5, updated_at = now() where id = $1 returning id, term, bem, nya, note, updated_at",
      [req.params.id, term, bem, nya, note],
    );
    if (!rows[0]) throw notFound("Term not found.");
    res.json(rows[0]);
  }),
);

adminTranslationsRouter.delete(
  "/glossary/:id",
  asyncHandler(async (req, res) => {
    await query("delete from translation_glossary where id = $1", [req.params.id]);
    res.status(204).end();
  }),
);

/** For unit tests only. */
export const _forTests = { aiTranslate };
