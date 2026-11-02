// Public, read-only content endpoints. Only published rows are returned.
import { Router } from "express";
import { query } from "../db.js";
import { asyncHandler, notFound } from "../lib/http.js";
import { overlay, overlayLang } from "../lib/translate.js";

export const contentRouter = Router();

contentRouter.get(
  "/pages/:slug",
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      "select slug, hero_title, hero_subline, body, updated_at from site_pages where slug = $1 and is_published = true",
      [req.params.slug],
    );
    res.json(rows[0] ?? null);
  }),
);

contentRouter.get(
  "/settings/:key",
  asyncHandler(async (req, res) => {
    const { rows } = await query<{ value: unknown }>(
      "select value from site_settings where key = $1",
      [req.params.key],
    );
    res.json({ value: rows[0]?.value ?? null });
  }),
);

contentRouter.get(
  "/categories",
  asyncHandler(async (req, res) => {
    const { rows } = await query("select * from categories order by sort_order");
    await overlay("category", overlayLang(req.query.lang), rows);
    res.json(rows);
  }),
);

// Published pathways (top-level tracks), each with a published-course count.
contentRouter.get(
  "/pathways",
  asyncHandler(async (req, res) => {
    const { rows } = await query(`
      select p.*,
             (select count(*) from courses c where c.pathway_id = p.id and c.is_published = true)::int as course_count
        from pathways p
       where p.is_published = true
       order by p.sort_order
    `);
    await overlay("pathway", overlayLang(req.query.lang), rows);
    res.json(rows);
  }),
);

// One pathway with its published courses (each with category + lesson ids).
contentRouter.get(
  "/pathways/:slug",
  asyncHandler(async (req, res) => {
    const { rows: pr } = await query("select * from pathways where slug = $1 and is_published = true", [req.params.slug]);
    if (!pr[0]) throw notFound("Pathway not found");
    const plang = overlayLang(req.query.lang);
    await overlay("pathway", plang, pr);
    const { rows: courses } = await query(
      `select c.*, to_jsonb(cat.*) as category,
              coalesce((select jsonb_agg(jsonb_build_object('id', l.id, 'is_published', l.is_published) order by l.sort_order)
                          from lessons l where l.course_id = c.id and l.is_published = true), '[]'::jsonb) as lessons
         from courses c left join categories cat on cat.id = c.category_id
        where c.pathway_id = $1 and c.is_published = true order by c.sort_order`,
      [pr[0].id],
    );
    await overlay("course", plang, courses);
    await overlay("category", plang, courses.map((c) => c.category as Record<string, unknown>).filter(Boolean));
    res.json({ pathway: pr[0], courses });
  }),
);

// Published courses, each with its category, pathway and published lesson ids.
// Optional ?pathway=<slug> filter.
contentRouter.get(
  "/courses",
  asyncHandler(async (req, res) => {
    const pathway = typeof req.query.pathway === "string" ? req.query.pathway : null;
    const { rows } = await query(
      `select c.*,
              to_jsonb(cat.*) as category,
              jsonb_build_object('slug', p.slug, 'title', p.title) as pathway,
              coalesce(
                (select jsonb_agg(jsonb_build_object('id', l.id, 'slug', l.slug, 'is_published', l.is_published) order by l.sort_order)
                   from lessons l where l.course_id = c.id and l.is_published = true),
                '[]'::jsonb) as lessons
         from courses c
         left join categories cat on cat.id = c.category_id
         left join pathways p on p.id = c.pathway_id
        where c.is_published = true and ($1::text is null or p.slug = $1)
        order by c.sort_order`,
      [pathway],
    );
    const clang = overlayLang(req.query.lang);
    await overlay("course", clang, rows);
    await overlay("category", clang, rows.map((c) => c.category as Record<string, unknown>).filter(Boolean));
    res.json(rows);
  }),
);

// One course with its full published lessons.
contentRouter.get(
  "/courses/:slug",
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `select c.*,
              to_jsonb(cat.*) as category,
              coalesce(
                (select jsonb_agg(to_jsonb(l.*) order by l.sort_order)
                   from lessons l where l.course_id = c.id and l.is_published = true),
                '[]'::jsonb) as lessons
         from courses c
         left join categories cat on cat.id = c.category_id
        where c.slug = $1 and c.is_published = true`,
      [req.params.slug],
    );
    if (!rows[0]) throw notFound("Course not found");
    const lang = overlayLang(req.query.lang);
    await overlay("course", lang, rows);
    await overlay("category", lang, [rows[0].category as Record<string, unknown>].filter(Boolean));
    await overlay("lesson", lang, (rows[0].lessons as Record<string, unknown>[]) ?? []);
    res.json(rows[0]);
  }),
);

contentRouter.get(
  "/lessons/:id/quiz",
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      "select * from quiz_questions where lesson_id = $1 order by sort_order",
      [req.params.id],
    );
    await overlay("quiz_question", overlayLang(req.query.lang), rows);
    res.json(rows);
  }),
);

contentRouter.get(
  "/lessons/:id/scenario",
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      "select id, lesson_id, prompt, options, feedback, best_index, sort_order from scenario_steps where lesson_id = $1 order by sort_order",
      [req.params.id],
    );
    await overlay("scenario_step", overlayLang(req.query.lang), rows);
    res.json(rows);
  }),
);

const PUBLISHED_TABLES = new Set(["testimonials", "partners", "faqs", "stats"]);

contentRouter.get(
  "/published/:table",
  asyncHandler(async (req, res) => {
    const table = String(req.params.table);
    if (!PUBLISHED_TABLES.has(table)) throw notFound();
    let sql: string;
    if (table === "stats") {
      sql = "select * from stats order by sort_order";
    } else if (table === "faqs") {
      sql = "select * from faqs where is_published = true order by sort_order";
    } else {
      sql = `select * from ${table} where is_published = true`;
    }
    const { rows } = await query(sql);
    res.json(rows);
  }),
);

contentRouter.get(
  "/i18n",
  asyncHandler(async (_req, res) => {
    const { rows } = await query("select key, lang, value from i18n_strings");
    res.json(rows);
  }),
);
