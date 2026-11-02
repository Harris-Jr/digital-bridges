// CMS endpoints for staff (editor/admin). Guarded by requireStaff.
// Unlike the public content router, these return unpublished rows too and allow
// create/update/delete. Columns are whitelisted per resource so request bodies
// can never write to an arbitrary column.
import { Router, type Request, type Response } from "express";
import { z, type ZodType } from "zod";
import { query, withTransaction } from "../db.js";
import { asyncHandler, badRequest, notFound } from "../lib/http.js";
import { requireAuth, requireStaff } from "../middleware.js";
import { sendMail, workshopDecisionEmail } from "../lib/mailer.js";

export const adminRouter = Router();
adminRouter.use(requireAuth, requireStaff);

type ResourceDef = {
  table: string;
  idColumn: string; // "id" (uuid) or "slug" (text) for site_pages
  columns: string[]; // writable columns (create + update)
  jsonbColumns?: string[]; // columns stored as jsonb, stringified before binding
  orderBy: string;
  schema: ZodType; // validates create bodies; update uses .partial() when possible
  allowCreate?: boolean;
  allowDelete?: boolean;
  filters?: string[]; // query-string columns allowed to filter the list
};

function toParam(value: unknown, isJsonb: boolean): unknown {
  if (isJsonb) return JSON.stringify(value ?? null);
  return value;
}

function registerResource(name: string, def: ResourceDef): void {
  const jsonb = new Set(def.jsonbColumns ?? []);
  const base = `/${name}`;

  // LIST (optionally filtered)
  adminRouter.get(
    base,
    asyncHandler(async (req: Request, res: Response) => {
      const where: string[] = [];
      const params: unknown[] = [];
      for (const f of def.filters ?? []) {
        const v = req.query[f];
        if (v !== undefined) {
          params.push(v);
          where.push(`${f} = $${params.length}`);
        }
      }
      const clause = where.length ? `where ${where.join(" and ")}` : "";
      const { rows } = await query(`select * from ${def.table} ${clause} order by ${def.orderBy}`, params);
      res.json(rows);
    }),
  );

  // GET ONE
  adminRouter.get(
    `${base}/:id`,
    asyncHandler(async (req, res) => {
      const { rows } = await query(`select * from ${def.table} where ${def.idColumn} = $1`, [req.params.id]);
      if (!rows[0]) throw notFound();
      res.json(rows[0]);
    }),
  );

  // CREATE
  if (def.allowCreate !== false) {
    adminRouter.post(
      base,
      asyncHandler(async (req, res) => {
        const parsed = def.schema.safeParse(req.body);
        if (!parsed.success) throw badRequest(firstIssue(parsed.error));
        const data = parsed.data as Record<string, unknown>;
        const cols = def.columns.filter((c) => data[c] !== undefined);
        if (cols.length === 0) throw badRequest("Nothing to create.");
        const values = cols.map((c) => toParam(data[c], jsonb.has(c)));
        const placeholders = cols.map((_, i) => `$${i + 1}`);
        const { rows } = await query(
          `insert into ${def.table} (${cols.join(", ")}) values (${placeholders.join(", ")}) returning *`,
          values,
        );
        res.status(201).json(rows[0]);
      }),
    );
  }

  // UPDATE (partial)
  adminRouter.patch(
    `${base}/:id`,
    asyncHandler(async (req, res) => {
      const partial = (def.schema as z.ZodObject<z.ZodRawShape>).partial?.() ?? def.schema;
      const parsed = partial.safeParse(req.body);
      if (!parsed.success) throw badRequest(firstIssue(parsed.error));
      const data = parsed.data as Record<string, unknown>;
      const cols = def.columns.filter((c) => data[c] !== undefined);
      if (cols.length === 0) throw badRequest("Nothing to update.");
      const sets = cols.map((c, i) => `${c} = $${i + 1}`);
      const values = cols.map((c) => toParam(data[c], jsonb.has(c)));
      if (def.columns.includes("updated_at") === false && hasColumn(def.table, "updated_at")) {
        sets.push("updated_at = now()");
      }
      values.push(req.params.id);
      const { rows } = await query(
        `update ${def.table} set ${sets.join(", ")} where ${def.idColumn} = $${values.length} returning *`,
        values,
      );
      if (!rows[0]) throw notFound();
      res.json(rows[0]);
    }),
  );

  // DELETE
  if (def.allowDelete !== false) {
    adminRouter.delete(
      `${base}/:id`,
      asyncHandler(async (req, res) => {
        const { rowCount } = await query(`delete from ${def.table} where ${def.idColumn} = $1`, [req.params.id]);
        if (!rowCount) throw notFound();
        res.status(204).end();
      }),
    );
  }
}

function firstIssue(err: z.ZodError): string {
  return err.issues[0]?.message ?? "Please check the fields you entered.";
}

// Tables that carry an updated_at we should bump on update.
const UPDATED_AT_TABLES = new Set(["courses", "lessons", "site_pages"]);
function hasColumn(table: string, column: string): boolean {
  return column === "updated_at" && UPDATED_AT_TABLES.has(table);
}

// ---- Schemas ----------------------------------------------------------------
const nonEmpty = (max: number) => z.string().trim().min(1).max(max);

const categorySchema = z.object({
  slug: nonEmpty(80),
  name: nonEmpty(120),
  icon_name: z.string().trim().max(60).default("Circle"),
  sort_order: z.coerce.number().int().default(0),
});

const pathwaySchema = z.object({
  slug: nonEmpty(80),
  title: nonEmpty(120),
  subtitle: z.string().trim().max(200).default(""),
  description: z.string().trim().max(2000).default(""),
  icon_name: z.string().trim().max(60).default("Compass"),
  accent: z.enum(["primary", "accent"]).default("primary"),
  sort_order: z.coerce.number().int().default(0),
  is_published: z.boolean().default(true),
});

const courseSchema = z.object({
  slug: nonEmpty(120),
  title: nonEmpty(200),
  tagline: z.string().trim().max(300).default(""),
  description: z.string().trim().max(5000).default(""),
  category_id: z.string().uuid().nullish(),
  pathway_id: z.string().uuid().nullish(),
  icon_name: z.string().trim().max(60).default("BookOpen"),
  difficulty: z.enum(["start_here", "easy", "intermediate"]).default("easy"),
  estimated_hours: z.coerce.number().min(0).default(1),
  outcomes: z.array(z.string()).default([]),
  image_url: z.string().trim().max(1000).nullish(),
  is_published: z.boolean().default(false),
  sort_order: z.coerce.number().int().default(0),
  pass_mark: z.coerce.number().int().min(0).max(100).default(70),
});

const moduleSchema = z.object({
  course_id: z.string().uuid(),
  title: nonEmpty(200),
  summary: z.string().trim().max(1000).default(""),
  sort_order: z.coerce.number().int().default(0),
  is_published: z.boolean().default(true),
});

const lessonSchema = z.object({
  course_id: z.string().uuid(),
  module_id: z.string().uuid().nullish(),
  est_minutes: z.coerce.number().int().min(1).max(60).default(5),
  slug: nonEmpty(120),
  title: nonEmpty(200),
  type: z.enum(["read", "quiz", "practice", "scenario"]).default("read"),
  body_richtext: z.string().max(20000).default(""),
  key_points: z.array(z.string()).default([]),
  try_it_action: z.string().trim().max(1000).nullish(),
  svg_motif: z.string().trim().max(60).nullish(),
  image_url: z.string().trim().max(1000).nullish(),
  audio_url: z.string().trim().max(1000).nullish(),
  video_url: z.string().trim().max(1000).nullish(),
  sort_order: z.coerce.number().int().default(0),
  is_published: z.boolean().default(true),
});

const quizSchema = z.object({
  lesson_id: z.string().uuid(),
  question: nonEmpty(1000),
  options: z.array(z.string()).min(2),
  correct_index: z.coerce.number().int().min(0).default(0),
  explanation: z.string().max(2000).default(""),
  sort_order: z.coerce.number().int().default(0),
});

const scenarioSchema = z.object({
  lesson_id: z.string().uuid(),
  prompt: nonEmpty(1000),
  options: z.array(z.string()).min(2),
  feedback: z.array(z.string()).default([]),
  best_index: z.coerce.number().int().min(0).default(0),
  sort_order: z.coerce.number().int().default(0),
});

const blockSchema = z.object({
  id: z.string().min(1).max(60),
  type: z.string().min(1).max(40).regex(/^[a-z_]+$/),
  hidden: z.boolean().optional(),
  data: z.record(z.string(), z.unknown()).default({}),
});

const sitePageSchema = z.object({
  slug: z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/, "Address: lowercase words with dashes"),
  hero_title: z.string().max(300).default(""),
  hero_subline: z.string().max(600).default(""),
  hero_eyebrow: z.string().max(120).default(""),
  hero_image_url: z.string().trim().max(1000).nullish(),
  nav_label: z.string().trim().max(60).default(""),
  body: z.record(z.string(), z.unknown()).default({}),
  blocks: z.array(blockSchema).max(60).default([]),
  is_published: z.boolean().default(true),
});

const testimonialSchema = z.object({
  quote: nonEmpty(1000),
  name: nonEmpty(120),
  role_location: z.string().trim().max(200).default(""),
  is_published: z.boolean().default(false),
});

const partnerSchema = z.object({
  name: nonEmpty(200),
  category: z.enum(["school", "radio", "cs", "ict_hub", "gov", "telecom"]).default("cs"),
  is_published: z.boolean().default(false),
});

const resourceSchema = z.object({
  title: nonEmpty(200),
  description: z.string().trim().max(1000).default(""),
  type: z.enum(["pdf", "doc", "slides", "image", "video", "link"]).default("pdf"),
  file_url: nonEmpty(1000),
  audience: z.enum(["trainer", "learner"]).default("trainer"),
  sort_order: z.coerce.number().int().default(0),
  is_published: z.boolean().default(false),
});

const postSchema = z.object({
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/, "Slug: lowercase words with dashes"),
  title: nonEmpty(200),
  excerpt: z.string().trim().max(400).default(""),
  body: z.string().max(50000).default(""),
  cover_url: z.string().trim().max(1000).nullish(),
  cover_alt: z.string().trim().max(300).default(""),
  tags: z.array(z.string().trim().min(1).max(40)).max(10).default([]),
  author_name: z.string().trim().max(120).default(""),
  status: z.enum(["draft", "published"]).default("draft"),
});

const faqSchema = z.object({
  question: nonEmpty(500),
  answer: nonEmpty(5000),
  sort_order: z.coerce.number().int().default(0),
  is_published: z.boolean().default(false),
});

// ---- Register resources -----------------------------------------------------
registerResource("categories", {
  table: "categories", idColumn: "id", orderBy: "sort_order",
  columns: ["slug", "name", "icon_name", "sort_order"], schema: categorySchema,
});
registerResource("pathways", {
  table: "pathways", idColumn: "id", orderBy: "sort_order",
  columns: ["slug", "title", "subtitle", "description", "icon_name", "accent", "sort_order", "is_published"],
  schema: pathwaySchema,
});
registerResource("courses", {
  table: "courses", idColumn: "id", orderBy: "sort_order",
  columns: ["slug", "title", "tagline", "description", "category_id", "pathway_id", "icon_name", "difficulty", "estimated_hours", "outcomes", "image_url", "is_published", "sort_order", "pass_mark"],
  jsonbColumns: ["outcomes"], schema: courseSchema,
});
registerResource("lessons", {
  table: "lessons", idColumn: "id", orderBy: "sort_order",
  columns: ["course_id", "module_id", "est_minutes", "slug", "title", "type", "body_richtext", "key_points", "try_it_action", "svg_motif", "image_url", "audio_url", "video_url", "sort_order", "is_published"],
  jsonbColumns: ["key_points"], schema: lessonSchema, filters: ["course_id"],
});
registerResource("modules", {
  table: "modules", idColumn: "id", orderBy: "sort_order",
  columns: ["course_id", "title", "summary", "sort_order", "is_published"],
  schema: moduleSchema, filters: ["course_id"],
});
registerResource("quiz-questions", {
  table: "quiz_questions", idColumn: "id", orderBy: "sort_order",
  columns: ["lesson_id", "question", "options", "correct_index", "explanation", "sort_order"],
  jsonbColumns: ["options"], schema: quizSchema, filters: ["lesson_id"],
});
registerResource("scenario-steps", {
  table: "scenario_steps", idColumn: "id", orderBy: "sort_order",
  columns: ["lesson_id", "prompt", "options", "feedback", "best_index", "sort_order"],
  jsonbColumns: ["options", "feedback"], schema: scenarioSchema, filters: ["lesson_id"],
});
registerResource("site-pages", {
  table: "site_pages", idColumn: "slug", orderBy: "slug",
  columns: ["slug", "hero_title", "hero_subline", "hero_eyebrow", "hero_image_url", "nav_label", "body", "blocks", "is_published"],
  jsonbColumns: ["body", "blocks"], schema: sitePageSchema, allowDelete: false,
});
registerResource("testimonials", {
  table: "testimonials", idColumn: "id", orderBy: "created_at desc",
  columns: ["quote", "name", "role_location", "is_published"], schema: testimonialSchema,
});
registerResource("partners", {
  table: "partners", idColumn: "id", orderBy: "created_at desc",
  columns: ["name", "category", "is_published"], schema: partnerSchema,
});
registerResource("resources", {
  table: "resources", idColumn: "id", orderBy: "sort_order, title",
  columns: ["title", "description", "type", "file_url", "audience", "sort_order", "is_published"],
  schema: resourceSchema,
});
registerResource("posts", {
  table: "posts", idColumn: "id", orderBy: "coalesce(published_at, created_at) desc",
  columns: ["slug", "title", "excerpt", "body", "cover_url", "cover_alt", "tags", "author_name", "status"],
  schema: postSchema,
});
registerResource("faqs", {
  table: "faqs", idColumn: "id", orderBy: "sort_order",
  columns: ["question", "answer", "sort_order", "is_published"], schema: faqSchema,
});

// Branding / media settings: key-value rows in site_settings holding Cloudinary
// URLs, so the logo and page images are editable from the CMS instead of being
// baked into the build. Whitelisted keys only.
const BRANDING_KEYS = new Set(["brand_logo_url", "about_image_url", "trainers_image_url"]);

adminRouter.get(
  "/settings",
  asyncHandler(async (_req, res) => {
    const { rows } = await query<{ key: string; value: unknown }>("select key, value from site_settings");
    res.json(Object.fromEntries(rows.map((r) => [r.key, r.value])));
  }),
);

adminRouter.put(
  "/settings/:key",
  asyncHandler(async (req, res) => {
    const key = String(req.params.key ?? "");
    if (!BRANDING_KEYS.has(key)) throw badRequest("Unknown setting.");
    const parsed = z.object({ value: z.string().trim().max(2000).nullable() }).safeParse(req.body);
    if (!parsed.success) throw badRequest("Invalid value.");
    const value = parsed.data.value && parsed.data.value.length > 0 ? parsed.data.value : null;
    await query(
      "insert into site_settings (key, value) values ($1, $2::jsonb) on conflict (key) do update set value = excluded.value, updated_at = now()",
      [key, JSON.stringify(value)],
    );
    res.json({ ok: true });
  }),
);

// Workshop requests from facilitators, newest first, with the requester's name.
adminRouter.get(
  "/workshop-requests",
  asyncHandler(async (req, res) => {
    const status = typeof req.query.status === "string" ? req.query.status : "";
    const valid = ["pending", "approved", "declined"].includes(status);
    const { rows } = await query(
      `select w.id, w.topic, w.date, w.venue, w.expected_learners, w.status, w.created_at,
              coalesce(p.full_name, u.email) as trainer_name, u.email as trainer_email
         from workshop_requests w
         join users u on u.id = w.trainer_id
         left join profiles p on p.id = w.trainer_id
        ${valid ? "where w.status = $1" : ""}
        order by w.created_at desc`,
      valid ? [status] : [],
    );
    res.json(rows);
  }),
);

// Approve or decline a workshop request.
adminRouter.patch(
  "/workshop-requests/:id",
  asyncHandler(async (req, res) => {
    const schema = z.object({ status: z.enum(["approved", "declined", "pending"]) });
    const input = schema.safeParse(req.body);
    if (!input.success) throw badRequest("Choose approve or decline.");
    const { rows } = await query<{ id: string; status: string; topic: string; email: string }>(
      `update workshop_requests w set status = $1 from users u
         where w.id = $2 and u.id = w.trainer_id
         returning w.id, w.status, w.topic, u.email`,
      [input.data.status, req.params.id],
    );
    const row = rows[0];
    if (!row) throw notFound("Request not found.");

    // Notify the facilitator when a decision is made (fire-and-forget).
    if (row.status === "approved" || row.status === "declined") {
      const mail = workshopDecisionEmail(row.topic, row.status === "approved");
      void sendMail({ to: row.email, subject: mail.subject, html: mail.html });
    }
    res.json({ id: row.id, status: row.status });
  }),
);

// Lightweight dashboard counts for the CMS landing page.
adminRouter.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const { rows } = await query(`
      select
        (select count(*) from courses) as courses,
        (select count(*) from courses where is_published) as published_courses,
        (select count(*) from lessons) as lessons,
        (select count(*) from users) as users,
        (select count(*) from workshop_requests where status = 'pending') as pending_workshops,
        (select count(*) from contact_messages where read = false) as unread_messages
    `);
    res.json(rows[0]);
  }),
);

// ---- Course builder ---------------------------------------------------------
// The whole curriculum of one course in a single call: modules in order, each
// with its lessons (plus word count and quiz size, for the beginner checklist).
// Lessons with no module are returned under `unassigned`.
adminRouter.get(
  "/courses/:id/curriculum",
  asyncHandler(async (req, res) => {
    const id = z.string().uuid().safeParse(req.params.id);
    if (!id.success) throw notFound();
    const { rows: course } = await query("select * from courses where id = $1", [id.data]);
    if (!course[0]) throw notFound("Course not found");
    const { rows: modules } = await query(
      "select * from modules where course_id = $1 order by sort_order, created_at",
      [id.data],
    );
    const { rows: lessons } = await query(
      `select l.id, l.module_id, l.slug, l.title, l.type, l.is_published, l.sort_order, l.est_minutes,
              coalesce(array_length(regexp_split_to_array(nullif(trim(l.body_richtext), ''), '\\s+'), 1), 0) as words,
              (select count(*) from quiz_questions q where q.lesson_id = l.id)::int as quiz_count,
              (select count(*) from scenario_steps s where s.lesson_id = l.id)::int as scenario_count
         from lessons l where l.course_id = $1 order by l.sort_order, l.created_at`,
      [id.data],
    );
    res.json({
      course: course[0],
      modules: modules.map((m) => ({ ...m, lessons: lessons.filter((l) => l.module_id === m.id) })),
      unassigned: lessons.filter((l) => !l.module_id || !modules.some((m) => m.id === l.module_id)),
    });
  }),
);

// Save a new order: module order, and which lessons sit in which module in what
// order. One transaction, and every id must belong to this course.
adminRouter.put(
  "/courses/:id/curriculum",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      modules: z.array(z.object({ id: z.string().uuid(), lessons: z.array(z.string().uuid()) })).max(100),
    });
    const id = z.string().uuid().safeParse(req.params.id);
    const input = schema.safeParse(req.body);
    if (!id.success || !input.success) throw badRequest("Invalid course structure.");
    await withTransaction(async (client) => {
      for (const [mi, m] of input.data.modules.entries()) {
        const r = await client.query("update modules set sort_order = $3 where id = $1 and course_id = $2", [m.id, id.data, mi]);
        if (!r.rowCount) throw badRequest("A module does not belong to this course.");
        for (const [li, lessonId] of m.lessons.entries()) {
          const lr = await client.query(
            "update lessons set module_id = $3, sort_order = $4 where id = $1 and course_id = $2",
            [lessonId, id.data, m.id, (mi + 1) * 1000 + li],
          );
          if (!lr.rowCount) throw badRequest("A lesson does not belong to this course.");
        }
      }
    });
    res.json({ ok: true });
  }),
);

// ---- Cohorts overview (read-only) -------------------------------------------
// Every facilitator cohort with its facilitator, size, activity and completion,
// so staff can see how programmes are going across the country.
adminRouter.get(
  "/cohorts",
  asyncHandler(async (_req, res) => {
    const { rows } = await query(`
      select g.id, g.name, g.location, g.created_at, g.join_code,
             coalesce(p.full_name, u.email, '') as facilitator, u.email as facilitator_email,
             (select count(*)::int from cohort_members m where m.group_id = g.id) as member_count,
             (select count(*)::int from cohort_sessions s where s.group_id = g.id) as session_count,
             (select count(distinct m.user_id)::int from cohort_members m
                join lesson_progress lp on lp.user_id = m.user_id
               where m.group_id = g.id and lp.completed_at > now() - interval '30 days') as active_30d,
             coalesce((select count(*)::int from certificates c join cohort_members m on m.user_id = c.user_id
                        where m.group_id = g.id), 0) as certificates
        from community_groups g
        left join users u on u.id = g.trainer_id
        left join profiles p on p.id = g.trainer_id
       order by g.created_at desc`);
    res.json(rows);
  }),
);

// Delete a custom page. Built-in pages (home, about, ...) cannot be deleted.
adminRouter.delete(
  "/site-pages/:slug",
  asyncHandler(async (req, res) => {
    const { rowCount } = await query("delete from site_pages where slug = $1 and not is_system", [req.params.slug]);
    if (!rowCount) throw badRequest("Built-in pages cannot be deleted. You can unpublish them instead.");
    res.json({ ok: true });
  }),
);
