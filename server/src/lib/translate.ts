// Content translation overlay. Base tables hold the English source of truth;
// `content_translations` holds per-field overrides per language. At read time
// we fetch the overrides for the rows in hand and apply them in place. A
// missing field (e.g. a long lesson body not yet translated) simply keeps its
// English value — graceful fallback, no special-casing per field.
import { query } from "../db.js";

const SUPPORTED = new Set(["bem", "nya"]);

/** Normalise a ?lang= value to a supported non-English code, else null (= English, no overlay). */
export function overlayLang(v: unknown): string | null {
  const s = typeof v === "string" ? v.trim().toLowerCase() : "";
  return SUPPORTED.has(s) ? s : null;
}

type Row = Record<string, unknown> & { id?: unknown };

/**
 * Overlay translations onto base rows, mutating them in place.
 * No-op when lang is English/unknown or there are no rows.
 */
export async function overlay(entityType: string, lang: string | null, rows: Row[]): Promise<void> {
  if (!lang || rows.length === 0) return;
  const ids = rows.map((r) => r.id).filter((x): x is string => typeof x === "string");
  if (ids.length === 0) return;
  const { rows: trs } = await query<{ entity_id: string; field: string; value: unknown }>(
    `select entity_id, field, value
       from content_translations
      where entity_type = $1 and lang = $2 and entity_id = any($3::uuid[])`,
    [entityType, lang, ids],
  );
  if (trs.length === 0) return;
  const byId = new Map<string, Record<string, unknown>>();
  for (const t of trs) {
    let m = byId.get(t.entity_id);
    if (!m) { m = {}; byId.set(t.entity_id, m); }
    // pg already parses jsonb, so `value` is the string/array itself.
    m[t.field] = t.value;
  }
  for (const r of rows) {
    const m = typeof r.id === "string" ? byId.get(r.id) : undefined;
    if (m) Object.assign(r, m);
  }
}
