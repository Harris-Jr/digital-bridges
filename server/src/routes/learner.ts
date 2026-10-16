// Authenticated learner endpoints: progress, badges, consent, data rights.
import { Router } from "express";
import type { PoolClient } from "pg";
import { z } from "zod";
import { query, withTransaction } from "../db.js";
import { asyncHandler, badRequest, notFound } from "../lib/http.js";
import { requireAuth } from "../middleware.js";

export const learnerRouter = Router();
learnerRouter.use(requireAuth);

function computeStreak(dates: string[]): number {
  const days = new Set(dates.map((d) => new Date(d).toISOString().slice(0, 10)));
  let streak = 0;
  const cur = new Date();
  if (!days.has(cur.toISOString().slice(0, 10))) cur.setDate(cur.getDate() - 1);
  while (days.has(cur.toISOString().slice(0, 10))) {
    streak++;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}

/**
 * Re-evaluate badge criteria against the user's current progress and insert any
 * newly-earned badges. Runs inside the caller's transaction, so progress and
 * badges commit together (atomicity). Returns the number of new badges.
 */
async function awardBadges(client: PoolClient, userId: string): Promise<number> {
  // A single client cannot run queries concurrently, so these reads run
  // sequentially within the transaction.
  const { rows: prog } = await client.query<{ lesson_id: string; completed_at: string }>(
    "select lesson_id, completed_at from lesson_progress where user_id = $1",
    [userId],
  );
  const { rows: badges } = await client.query<{ id: string; slug: string; criteria: Record<string, unknown> }>(
    "select id, slug, criteria from badges",
  );
  const { rows: courses } = await client.query<{ slug: string; lesson_ids: string[] }>(`
      select c.slug,
             coalesce(array_agg(l.id) filter (where l.is_published), '{}') as lesson_ids
        from courses c
        left join lessons l on l.course_id = c.id
       where c.is_published = true
       group by c.slug
    `);
  const { rows: have } = await client.query<{ badge_id: string }>(
    "select badge_id from user_badges where user_id = $1",
    [userId],
  );

  const done = new Set(prog.map((p) => p.lesson_id));
  const streak = computeStreak(prog.map((p) => p.completed_at));
  const owned = new Set(have.map((h) => h.badge_id));
  const courseLessons = new Map(courses.map((c) => [c.slug, c.lesson_ids]));

  const fresh: string[] = [];
  for (const b of badges) {
    if (owned.has(b.id)) continue;
    const cr = b.criteria as { lessons?: number; course?: string; streak?: number };
    let ok = false;
    if (cr.lessons) ok = done.size >= cr.lessons;
    if (cr.streak) ok = streak >= cr.streak;
    if (cr.course) {
      const ls = courseLessons.get(cr.course) ?? [];
      ok = ls.length > 0 && ls.every((id) => done.has(id));
    }
    if (ok) fresh.push(b.id);
  }

  for (const badgeId of fresh) {
    await client.query(
      "insert into user_badges (user_id, badge_id) values ($1, $2) on conflict do nothing",
      [userId, badgeId],
    );
  }
  return fresh.length;
}

learnerRouter.get(
  "/progress",
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      "select lesson_id, completed_at from lesson_progress where user_id = $1",
      [req.auth!.id],
    );
    res.json(rows);
  }),
);

// Mark a lesson complete. Transactional: the progress row and any badges it
// unlocks are written atomically, and the idempotent upsert makes a replayed
// (offline) request safe.
learnerRouter.post(
  "/progress",
  asyncHandler(async (req, res) => {
    const schema = z.object({ lesson_id: z.string().uuid() });
    const input = schema.safeParse(req.body);
    if (!input.success) throw badRequest("A valid lesson is required.");
    const userId = req.auth!.id;

    const result = await withTransaction(async (client) => {
      await client.query(
        `insert into lesson_progress (user_id, lesson_id) values ($1, $2)
         on conflict (user_id, lesson_id) do nothing`,
        [userId, input.data.lesson_id],
      );
      const badges = await awardBadges(client, userId);
      // Issue a certificate if the lesson's course is now fully complete.
      const { rows: cert } = await client.query<{ course_id: string }>(
        `insert into certificates (user_id, course_id)
         select $1, l.course_id from lessons l
          where l.id = $2
            and exists (select 1 from courses c where c.id = l.course_id and c.is_published)
            and not exists (
              select 1 from lessons x
               where x.course_id = l.course_id and x.is_published
                 and not exists (select 1 from lesson_progress lp where lp.user_id = $1 and lp.lesson_id = x.id))
         on conflict (user_id, course_id) do nothing
         returning course_id`,
        [userId, input.data.lesson_id],
      );
      let certificate: { slug: string; title: string } | null = null;
      if (cert[0]) {
        const { rows } = await client.query<{ slug: string; title: string }>(
          "select slug, title from courses where id = $1",
          [cert[0].course_id],
        );
        certificate = rows[0] ?? null;
      }
      return { badges, certificate };
    });

    res.json({ ok: true, badges_earned: result.badges, certificate: result.certificate });
  }),
);

// Earned course-completion certificates.
learnerRouter.get(
  "/certificates",
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `select ct.id, ct.issued_at, c.slug as course_slug, c.title as course_title
         from certificates ct join courses c on c.id = ct.course_id
        where ct.user_id = $1 order by ct.issued_at desc`,
      [req.auth!.id],
    );
    res.json(rows);
  }),
);

// One certificate (for the printable view), by course slug.
learnerRouter.get(
  "/certificates/:slug",
  asyncHandler(async (req, res) => {
    const { rows } = await query<{ id: string; issued_at: string; course_title: string; full_name: string }>(
      `select ct.id, ct.issued_at, c.title as course_title, coalesce(p.full_name, '') as full_name
         from certificates ct
         join courses c on c.id = ct.course_id
         left join profiles p on p.id = ct.user_id
        where ct.user_id = $1 and c.slug = $2`,
      [req.auth!.id, req.params.slug],
    );
    const row = rows[0];
    if (!row) throw notFound("Certificate not found");
    res.json({
      learner_name: row.full_name || "Learner",
      course_title: row.course_title,
      issued_at: row.issued_at,
      serial: `DB-${row.id.slice(0, 8).toUpperCase()}`,
    });
  }),
);

// Record a quiz attempt (optional; the client may submit a score).
learnerRouter.post(
  "/quiz-attempts",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      lesson_id: z.string().uuid(),
      score: z.coerce.number().int().min(0),
      total: z.coerce.number().int().min(0),
    });
    const input = schema.safeParse(req.body);
    if (!input.success) throw badRequest("Invalid attempt.");
    const { lesson_id, score, total } = input.data;
    const { rows } = await query<{ id: string }>(
      "insert into quiz_attempts (user_id, lesson_id, score, total) values ($1, $2, $3, $4) returning id",
      [req.auth!.id, lesson_id, score, total],
    );
    res.status(201).json({ id: rows[0]!.id });
  }),
);

learnerRouter.get(
  "/badges",
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `select b.*, (ub.user_id is not null) as earned
         from badges b
         left join user_badges ub on ub.badge_id = b.id and ub.user_id = $1
        order by b.name`,
      [req.auth!.id],
    );
    res.json(rows);
  }),
);

const consentSchema = z.object({
  type: z.enum(["cookies", "terms", "age", "newsletter", "data_export", "data_deletion", "policy_ack"]),
  version: z.string().default("1.0"),
  granted: z.boolean().default(true),
  details: z.record(z.string(), z.unknown()).default({}),
});

learnerRouter.post(
  "/consent",
  asyncHandler(async (req, res) => {
    const rows = Array.isArray(req.body) ? req.body : [req.body];
    const parsed = rows.map((r) => consentSchema.parse(r));
    await withTransaction(async (client) => {
      for (const c of parsed) {
        await client.query(
          "insert into consent_records (user_id, type, version, granted, details) values ($1, $2, $3, $4, $5)",
          [req.auth!.id, c.type, c.version, c.granted, c.details],
        );
      }
    });
    res.status(201).json({ ok: true });
  }),
);

// Has the user accepted the current policy version?
learnerRouter.get(
  "/consent/ack",
  asyncHandler(async (req, res) => {
    const version = String(req.query.version ?? "");
    const { rowCount } = await query(
      `select 1 from consent_records
        where user_id = $1 and version = $2 and type in ('terms','policy_ack') limit 1`,
      [req.auth!.id, version],
    );
    res.json({ acked: !!rowCount });
  }),
);

// Data export (Zambia DPA right of access).
learnerRouter.get(
  "/export",
  asyncHandler(async (req, res) => {
    const uid = req.auth!.id;
    const [profile, progress, badges, consents, workshops] = await Promise.all([
      query("select * from profiles where id = $1", [uid]),
      query("select lp.lesson_id, lp.completed_at, l.title from lesson_progress lp join lessons l on l.id = lp.lesson_id where lp.user_id = $1", [uid]),
      query("select ub.earned_at, b.name from user_badges ub join badges b on b.id = ub.badge_id where ub.user_id = $1", [uid]),
      query("select type, version, granted, details, granted_at from consent_records where user_id = $1", [uid]),
      query("select * from workshop_requests where trainer_id = $1", [uid]),
    ]);
    await query(
      "insert into data_requests (user_id, type, status) values ($1, 'export', 'done')",
      [uid],
    );
    res.json({
      exported_at: new Date().toISOString(),
      account: { id: uid, email: req.auth!.email },
      profile: profile.rows[0] ?? null,
      lesson_progress: progress.rows,
      badges: badges.rows,
      consent_records: consents.rows,
      workshop_requests: workshops.rows,
    });
  }),
);

// Account deletion (DPA right to erasure): anonymise profile, drop learning data.
learnerRouter.post(
  "/delete",
  asyncHandler(async (req, res) => {
    const uid = req.auth!.id;
    await withTransaction(async (client) => {
      await client.query("insert into data_requests (user_id, type) values ($1, 'delete')", [uid]);
      await client.query("delete from lesson_progress where user_id = $1", [uid]);
      await client.query("delete from user_badges where user_id = $1", [uid]);
      await client.query(
        "update profiles set full_name = 'Deleted learner', phone = null, district = null, anonymized = true where id = $1",
        [uid],
      );
    });
    res.json({ ok: true });
  }),
);
