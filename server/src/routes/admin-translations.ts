// Staff translation editor. Lets editors fill Bemba/Nyanja for any content
// field (notably long lesson bodies) into content_translations. The English
// base rows stay the source of truth; a blank translation deletes the override
// so the field falls back to English.
import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { asyncHandler, badRequest, notFound } from "../lib/http.js";
import { requireAuth, requireStaff } from "../middleware.js";

export const adminTranslationsRouter = Router();
adminTranslationsRouter.use(requireAuth, requireStaff);

const LANGS = ["bem", "nya"] as const;

// Translatable fields per entity, with how the editor should render them.
type FieldSpec = { name: string; type: "text" | "longtext" | "list"; label: string };
const FIELDS: Record<string, { table: string; fields: FieldSpec[] }> = {
  course: {
    table: "courses",
    fields: [
      { name: "title", type: "text", label: "Title" },
      { name: "tagline", type: "text", label: "Tagline" },
      { name: "description", type: "longtext", label: "Description" },
      { name: "outcomes", type: "list", label: "Outcomes" },
    ],
  },
  lesson: {
    table: "lessons",
    fields: [
      { name: "title", type: "text", label: "Title" },
      { name: "body_richtext", type: "longtext", label: "Lesson body" },
      { name: "key_points", type: "list", label: "Key points" },
      { name: "try_it_action", type: "text", label: "Try-it action" },
    ],
  },
};

// Picker data: every course with its lessons.
adminTranslationsRouter.get(
  "/targets",
  asyncHandler(async (_req, res) => {
    const { rows: courses } = await query<{ id: string; slug: string; title: string; sort_order: number }>(
      "select id, slug, title, sort_order from courses order by sort_order",
    );
    const { rows: lessons } = await query<{ id: string; course_id: string; slug: string; title: string; type: string; sort_order: number }>(
      "select id, course_id, slug, title, type, sort_order from lessons order by course_id, sort_order",
    );
    const byCourse = new Map<string, typeof lessons>();
    for (const l of lessons) {
      const arr = byCourse.get(l.course_id) ?? [];
      arr.push(l);
      byCourse.set(l.course_id, arr);
    }
    res.json(
      courses.map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        lessons: (byCourse.get(c.id) ?? []).map((l) => ({ id: l.id, slug: l.slug, title: l.title, type: l.type })),
      })),
    );
  }),
);

// English source + existing bem/nya overrides for one entity.
adminTranslationsRouter.get(
  "/:entityType/:entityId",
  asyncHandler(async (req, res) => {
    const spec = FIELDS[String(req.params.entityType)];
    if (!spec) throw notFound("Unknown content type.");
    const id = String(req.params.entityId);

    const cols = spec.fields.map((f) => f.name).join(", ");
    const { rows } = await query<Record<string, unknown>>(
      `select ${cols} from ${spec.table} where id = $1`,
      [id],
    );
    if (!rows[0]) throw notFound("Content not found.");

    const { rows: trs } = await query<{ lang: string; field: string; value: unknown }>(
      "select lang, field, value from content_translations where entity_type = $1 and entity_id = $2",
      [String(req.params.entityType), id],
    );
    const translations: Record<string, Record<string, unknown>> = { bem: {}, nya: {} };
    for (const t of trs) if (translations[t.lang]) translations[t.lang]![t.field] = t.value;

    res.json({
      entityType: req.params.entityType,
      entityId: id,
      fields: spec.fields,
      source: rows[0],
      translations,
    });
  }),
);

// Upsert (or clear) translations for one entity + language.
adminTranslationsRouter.put(
  "/:entityType/:entityId",
  asyncHandler(async (req, res) => {
    const spec = FIELDS[String(req.params.entityType)];
    if (!spec) throw notFound("Unknown content type.");
    const id = String(req.params.entityId);

    const schema = z.object({
      lang: z.enum(LANGS),
      fields: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
    });
    const input = schema.safeParse(req.body);
    if (!input.success) throw badRequest("Invalid translation payload.");
    const { lang, fields } = input.data;

    const allowed = new Set(spec.fields.map((f) => f.name));
    for (const [field, raw] of Object.entries(fields)) {
      if (!allowed.has(field)) continue;
      // Normalise: trim text; drop blank list items. Empty => clear override.
      const isList = spec.fields.find((f) => f.name === field)?.type === "list";
      let empty: boolean;
      let value: string | string[];
      if (isList) {
        const arr = (Array.isArray(raw) ? raw : [raw]).map((s) => String(s).trim()).filter(Boolean);
        value = arr;
        empty = arr.length === 0;
      } else {
        const s = (Array.isArray(raw) ? raw.join(" ") : raw).trim();
        value = s;
        empty = s.length === 0;
      }

      if (empty) {
        await query(
          "delete from content_translations where entity_type = $1 and entity_id = $2 and lang = $3 and field = $4",
          [req.params.entityType, id, lang, field],
        );
      } else {
        await query(
          `insert into content_translations (entity_type, entity_id, lang, field, value)
             values ($1, $2, $3, $4, $5::jsonb)
           on conflict (entity_type, entity_id, lang, field)
             do update set value = excluded.value, updated_at = now()`,
          [req.params.entityType, id, lang, field, JSON.stringify(value)],
        );
      }
    }
    res.json({ ok: true });
  }),
);
