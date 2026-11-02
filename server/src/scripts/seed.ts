// Files -> database. Loads server/content into Postgres. Safe to run again and
// again: everything is matched by slug and updated in place, so learner
// progress, certificates and badges are kept.
//
//   npm run seed                       every course + pathways, categories, badges
//   npm run seed -- getting-to-know-your-device   only the named course(s)
//   npm run seed -- --check            validate the files, touch nothing
//   npm run seed -- --prune            also DELETE lessons no longer in a file
//                                      (default: they are unpublished and kept,
//                                      so nobody loses progress)
//
// Note: seeding a course overwrites edits made to it in the CMS. Run
// `npm run content:export -- <slug>` first if you want to keep those edits.
import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { PoolClient } from "pg";
import { z } from "zod";
import { pool } from "../db.js";
import { badgeFile, categoryFile, courseFile, pathwayFile, type CourseFile, type LessonFile } from "./content-schema.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "content");
const args = process.argv.slice(2);
const CHECK = args.includes("--check");
const PRUNE = args.includes("--prune");
const only = args.filter((a) => !a.startsWith("--"));

async function readJson(path: string): Promise<unknown> {
  return JSON.parse(await readFile(path, "utf8"));
}

async function loadCourses(): Promise<CourseFile[]> {
  const dir = join(root, "courses");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".json")).sort();
  const out: CourseFile[] = [];
  const problems: string[] = [];
  for (const f of files) {
    const parsed = courseFile.safeParse(await readJson(join(dir, f)));
    if (!parsed.success) {
      problems.push(`${f}: ${parsed.error.issues.slice(0, 3).map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`);
      continue;
    }
    const c = parsed.data;
    if (`${c.slug}.json` !== f) problems.push(`${f}: file name must match slug "${c.slug}"`);
    const slugs = c.modules.flatMap((m) => m.lessons.map((l) => l.slug));
    const dup = slugs.find((s, i) => slugs.indexOf(s) !== i);
    if (dup) problems.push(`${f}: lesson slug "${dup}" is used twice`);
    out.push(c);
  }
  if (problems.length) throw new Error(`Content problems:\n  ${problems.join("\n  ")}`);
  return out;
}

const words = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);

/** Beginner-length report, printed for every course seeded or checked. */
function report(c: CourseFile) {
  const ls = c.modules.flatMap((m) => m.lessons);
  const long = ls.filter((l) => l.type !== "quiz" && words(l.body) > 400).map((l) => `${l.slug} (${words(l.body)})`);
  const noCheck = c.modules.filter((m) => !m.lessons.some((l) => l.type === "quiz" && l.quiz.length > 0)).map((m) => m.title);
  const mins = ls.reduce((n, l) => n + l.est_minutes, 0);
  console.log(`  ${c.slug}: ${c.modules.length} modules, ${ls.length} lessons, ~${mins} min`);
  if (long.length) console.log(`    long lessons: ${long.join(", ")}`);
  if (noCheck.length) console.log(`    modules without a check quiz: ${noCheck.join(", ")}`);
}

async function seedCatalogue(db: PoolClient) {
  const pathways = z.array(pathwayFile).parse(await readJson(join(root, "pathways.json")));
  for (const p of pathways) {
    await db.query(
      `insert into pathways (slug, title, subtitle, description, icon_name, accent, sort_order, is_published)
       values ($1,$2,$3,$4,$5,$6,$7,$8)
       on conflict (slug) do update set title=excluded.title, subtitle=excluded.subtitle, description=excluded.description,
         icon_name=excluded.icon_name, accent=excluded.accent, sort_order=excluded.sort_order, is_published=excluded.is_published`,
      [p.slug, p.title, p.subtitle, p.description, p.icon_name, p.accent, p.sort_order, p.published],
    );
  }
  const categories = z.array(categoryFile).parse(await readJson(join(root, "categories.json")));
  for (const c of categories) {
    await db.query(
      `insert into categories (slug, name, icon_name, sort_order) values ($1,$2,$3,$4)
       on conflict (slug) do update set name=excluded.name, icon_name=excluded.icon_name, sort_order=excluded.sort_order`,
      [c.slug, c.name, c.icon_name, c.sort_order],
    );
  }
  const badges = z.array(badgeFile).parse(await readJson(join(root, "badges.json")));
  for (const b of badges) {
    await db.query(
      `insert into badges (slug, name, description, criteria, icon_name) values ($1,$2,$3,$4,$5)
       on conflict (slug) do update set name=excluded.name, description=excluded.description, criteria=excluded.criteria, icon_name=excluded.icon_name`,
      [b.slug, b.name, b.description, JSON.stringify(b.criteria), b.icon_name],
    );
  }
  console.log(`[seed] ${pathways.length} pathways, ${categories.length} categories, ${badges.length} badges`);
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** When the English text of a field changes, its Bemba/Nyanja translation no
    longer matches, so remove it (the app falls back to English until it is
    translated again in Admin > Translations). Unchanged fields keep theirs. */
async function dropStale(db: PoolClient, entity: "course" | "lesson", id: string, fields: Record<string, [unknown, unknown]>) {
  const changed = Object.entries(fields).filter(([, [a, b]]) => !same(a, b)).map(([f]) => f);
  if (changed.length) {
    await db.query("delete from content_translations where entity_type = $1 and entity_id = $2 and field = any($3)", [entity, id, changed]);
  }
}

async function seedLessonExtras(db: PoolClient, lessonId: string, l: LessonFile) {
  // Quiz: only replaced when it actually changed, so translations of unchanged
  // questions (keyed by question id) survive a re-seed.
  const { rows: oldQ } = await db.query("select question, options, correct_index, explanation from quiz_questions where lesson_id = $1 order by sort_order", [lessonId]);
  const newQ = l.quiz.map((q) => ({ question: q.question, options: q.options, correct_index: q.correct, explanation: q.explanation }));
  if (!same(oldQ, newQ)) {
    await db.query("delete from quiz_questions where lesson_id = $1", [lessonId]);
    for (const [i, q] of newQ.entries()) {
      await db.query(
        "insert into quiz_questions (lesson_id, question, options, correct_index, explanation, sort_order) values ($1,$2,$3,$4,$5,$6)",
        [lessonId, q.question, JSON.stringify(q.options), q.correct_index, q.explanation, i],
      );
    }
  }
  const { rows: oldS } = await db.query("select prompt, options, feedback, best_index from scenario_steps where lesson_id = $1 order by sort_order", [lessonId]);
  const newS = l.scenario.map((s) => ({ prompt: s.prompt, options: s.options, feedback: s.feedback, best_index: s.best }));
  if (!same(oldS, newS)) {
    await db.query("delete from scenario_steps where lesson_id = $1", [lessonId]);
    for (const [i, s] of newS.entries()) {
      await db.query(
        "insert into scenario_steps (lesson_id, prompt, options, feedback, best_index, sort_order) values ($1,$2,$3,$4,$5,$6)",
        [lessonId, s.prompt, JSON.stringify(s.options), JSON.stringify(s.feedback), s.best_index, i],
      );
    }
  }
}

async function seedCourse(db: PoolClient, c: CourseFile) {
  const ref = async (table: "pathways" | "categories", slug: string | null | undefined) => {
    if (!slug) return null;
    const { rows } = await db.query(`select id from ${table} where slug = $1`, [slug]);
    if (!rows[0]) throw new Error(`${c.slug}: unknown ${table === "pathways" ? "pathway" : "category"} "${slug}"`);
    return rows[0].id as string;
  };
  const { rows: oldC } = await db.query("select id, title, tagline, description, outcomes from courses where slug = $1", [c.slug]);
  const { rows: cr } = await db.query(
    `insert into courses (slug, title, tagline, description, pathway_id, category_id, icon_name, difficulty, estimated_hours, pass_mark, outcomes, image_url, sort_order, is_published)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     on conflict (slug) do update set title=excluded.title, tagline=excluded.tagline, description=excluded.description,
       pathway_id=excluded.pathway_id, category_id=excluded.category_id, icon_name=excluded.icon_name, difficulty=excluded.difficulty,
       estimated_hours=excluded.estimated_hours, pass_mark=excluded.pass_mark, outcomes=excluded.outcomes, image_url=excluded.image_url,
       sort_order=excluded.sort_order, is_published=excluded.is_published, updated_at=now()
     returning id`,
    [c.slug, c.title, c.tagline, c.description, await ref("pathways", c.pathway), await ref("categories", c.category), c.icon_name,
      c.difficulty, c.estimated_hours, c.pass_mark, JSON.stringify(c.outcomes), c.image_url ?? null, c.sort_order, c.published],
  );
  const courseId = cr[0].id as string;
  if (oldC[0]) {
    await dropStale(db, "course", courseId, {
      title: [oldC[0].title, c.title], tagline: [oldC[0].tagline, c.tagline],
      description: [oldC[0].description, c.description], outcomes: [oldC[0].outcomes, c.outcomes],
    });
  }

  // Modules have no slug: reuse existing ones in order, add or drop the rest.
  const { rows: oldMods } = await db.query("select id from modules where course_id = $1 order by sort_order, created_at", [courseId]);
  const moduleIds: string[] = [];
  for (const [mi, m] of c.modules.entries()) {
    const existing = oldMods[mi]?.id as string | undefined;
    if (existing) {
      await db.query("update modules set title=$2, summary=$3, sort_order=$4, is_published=true where id=$1", [existing, m.title, m.summary, mi]);
      moduleIds.push(existing);
    } else {
      const { rows } = await db.query("insert into modules (course_id, title, summary, sort_order) values ($1,$2,$3,$4) returning id", [courseId, m.title, m.summary, mi]);
      moduleIds.push(rows[0].id);
    }
  }

  const seen = new Set<string>();
  for (const [mi, m] of c.modules.entries()) {
    for (const [li, l] of m.lessons.entries()) {
      seen.add(l.slug);
      const { rows: oldL } = await db.query("select id, title, key_points from lessons where course_id = $1 and slug = $2", [courseId, l.slug]);
      if (oldL[0]) await dropStale(db, "lesson", oldL[0].id, { title: [oldL[0].title, l.title], key_points: [oldL[0].key_points, l.key_points] });
      const { rows } = await db.query(
        `insert into lessons (course_id, module_id, slug, title, type, body_richtext, key_points, try_it_action, svg_motif, image_url, audio_url, video_url, est_minutes, sort_order, is_published)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
         on conflict (course_id, slug) do update set module_id=excluded.module_id, title=excluded.title, type=excluded.type,
           body_richtext=excluded.body_richtext, key_points=excluded.key_points, try_it_action=excluded.try_it_action,
           svg_motif=excluded.svg_motif, image_url=excluded.image_url, audio_url=excluded.audio_url, video_url=excluded.video_url,
           est_minutes=excluded.est_minutes, sort_order=excluded.sort_order, is_published=excluded.is_published, updated_at=now()
         returning id`,
        [courseId, moduleIds[mi], l.slug, l.title, l.type, l.body, JSON.stringify(l.key_points), l.try_it ?? null, l.motif ?? null,
          l.image_url ?? null, l.audio_url ?? null, l.video_url ?? null, l.est_minutes, (mi + 1) * 1000 + li, l.published],
      );
      await seedLessonExtras(db, rows[0].id, l);
    }
  }

  // Lessons in the database but no longer in the file.
  const { rows: stale } = await db.query<{ id: string; slug: string }>("select id, slug from lessons where course_id = $1", [courseId]);
  for (const s of stale.filter((r) => !seen.has(r.slug))) {
    if (PRUNE) {
      await db.query("delete from lessons where id = $1", [s.id]);
      console.log(`    deleted lesson ${s.slug}`);
    } else {
      await db.query("update lessons set is_published = false, module_id = null where id = $1", [s.id]);
      console.log(`    retired lesson ${s.slug} (unpublished, progress kept; use --prune to delete)`);
    }
  }
  for (const m of oldMods.slice(c.modules.length)) await db.query("delete from modules where id = $1", [m.id]);

  // Translations pointing at rows that no longer exist (replaced quiz questions etc.).
  await db.query(`delete from content_translations t where
      (t.entity_type = 'quiz_question' and not exists (select 1 from quiz_questions x where x.id = t.entity_id))
   or (t.entity_type = 'scenario_step' and not exists (select 1 from scenario_steps x where x.id = t.entity_id))
   or (t.entity_type = 'lesson' and not exists (select 1 from lessons x where x.id = t.entity_id))`);
}

async function main() {
  const all = await loadCourses();
  const courses = only.length ? all.filter((c) => only.includes(c.slug)) : all;
  const missing = only.filter((s) => !all.some((c) => c.slug === s));
  if (missing.length) throw new Error(`No content file for: ${missing.join(", ")}`);

  console.log(`[seed] ${CHECK ? "checking" : "seeding"} ${courses.length} course(s)`);
  courses.forEach(report);
  if (CHECK) { await pool.end(); return; }

  const db = await pool.connect();
  try {
    await db.query("begin");
    if (!only.length) await seedCatalogue(db);
    for (const c of courses) await seedCourse(db, c);
    await db.query("commit");
    console.log("[seed] done");
  } catch (e) {
    await db.query("rollback");
    throw e;
  } finally {
    db.release();
    await pool.end();
  }
}

main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
