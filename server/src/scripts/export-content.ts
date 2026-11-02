// Database -> files. Writes every course (with modules, lessons, quizzes and
// scenarios), plus pathways, categories and badges, to server/content as JSON.
// Use it to capture edits made in the CMS back into git:
//   npm run content:export            (all courses)
//   npm run content:export -- <slug>  (one course)
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../db.js";
import type { CourseFile } from "./content-schema.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "content");
type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const clean = <T extends Record<string, unknown>>(o: T): T =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0))) as T;

async function main() {
  const only = process.argv[2];
  await mkdir(join(root, "courses"), { recursive: true });
  const q = async (sql: string, p: unknown[] = []) => (await pool.query(sql, p)).rows as Row[];

  const pathways = await q("select * from pathways order by sort_order");
  const categories = await q("select * from categories order by sort_order");
  if (!only) {
    await writeFile(join(root, "pathways.json"), JSON.stringify(pathways.map((p) => ({ slug: p.slug, title: p.title, subtitle: p.subtitle, description: p.description, icon_name: p.icon_name, accent: p.accent, sort_order: p.sort_order, published: p.is_published })), null, 2) + "\n");
    await writeFile(join(root, "categories.json"), JSON.stringify(categories.map((c) => ({ slug: c.slug, name: c.name, icon_name: c.icon_name, sort_order: c.sort_order })), null, 2) + "\n");
    const badges = await q("select * from badges order by slug");
    await writeFile(join(root, "badges.json"), JSON.stringify(badges.map((b) => ({ slug: b.slug, name: b.name, description: b.description, criteria: b.criteria, icon_name: b.icon_name })), null, 2) + "\n");
  }

  const courses = await q(only ? "select * from courses where slug = $1" : "select * from courses order by sort_order", only ? [only] : []);
  for (const c of courses) {
    const modules = await q("select * from modules where course_id = $1 order by sort_order, created_at", [c.id]);
    const lessons = await q("select * from lessons where course_id = $1 order by sort_order, created_at", [c.id]);
    const lessonOut = async (l: Row) => {
      const quiz = await q("select * from quiz_questions where lesson_id = $1 order by sort_order", [l.id]);
      const scen = await q("select * from scenario_steps where lesson_id = $1 order by sort_order", [l.id]);
      return clean({
        slug: l.slug, title: l.title, type: l.type, est_minutes: l.est_minutes, body: l.body_richtext,
        key_points: l.key_points, try_it: l.try_it_action, motif: l.svg_motif, image_url: l.image_url,
        audio_url: l.audio_url, video_url: l.video_url, published: l.is_published,
        quiz: quiz.map((x) => clean({ question: x.question, options: x.options, correct: x.correct_index, explanation: x.explanation || undefined })),
        scenario: scen.map((x) => ({ prompt: x.prompt, options: x.options, feedback: x.feedback, best: x.best_index })),
      });
    };
    const mods = [];
    for (const m of modules) {
      const ls = lessons.filter((l) => l.module_id === m.id);
      if (ls.length) mods.push(clean({ title: m.title, summary: m.summary, lessons: await Promise.all(ls.map(lessonOut)) }));
    }
    const loose = lessons.filter((l) => !modules.some((m) => m.id === l.module_id));
    if (loose.length) mods.push({ title: "More lessons", lessons: await Promise.all(loose.map(lessonOut)) });

    const out = clean({
      slug: c.slug, title: c.title, tagline: c.tagline, description: c.description,
      pathway: pathways.find((p) => p.id === c.pathway_id)?.slug, category: categories.find((x) => x.id === c.category_id)?.slug,
      icon_name: c.icon_name, difficulty: c.difficulty, estimated_hours: Number(c.estimated_hours), pass_mark: c.pass_mark,
      outcomes: c.outcomes, image_url: c.image_url, sort_order: c.sort_order, published: c.is_published, modules: mods,
    }) as CourseFile;
    await writeFile(join(root, "courses", `${c.slug}.json`), JSON.stringify(out, null, 2) + "\n");
    console.log(`[export] ${c.slug}: ${mods.length} module(s), ${lessons.length} lesson(s)`);
  }
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
