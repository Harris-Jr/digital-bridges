// Public, read-only content endpoints. Only published rows are returned.
import { Router } from "express";
import { query } from "../db.js";
import { asyncHandler, notFound } from "../lib/http.js";

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
  asyncHandler(async (_req, res) => {
    const { rows } = await query("select * from categories order by sort_order");
    res.json(rows);
  }),
);

// Published courses, each with its category and the ids of its published lessons
// (enough for the catalogue and progress maths without shipping full lesson bodies).
contentRouter.get(
  "/courses",
  asyncHandler(async (_req, res) => {
    const { rows } = await query(`
      select c.*,
             to_jsonb(cat.*) as category,
             coalesce(
               (select jsonb_agg(jsonb_build_object('id', l.id, 'is_published', l.is_published) order by l.sort_order)
                  from lessons l where l.course_id = c.id and l.is_published = true),
               '[]'::jsonb) as lessons
        from courses c
        left join categories cat on cat.id = c.category_id
       where c.is_published = true
       order by c.sort_order
    `);
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
