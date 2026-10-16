// Facilitator endpoints. Reading community groups and own workshops requires a
// trainer role; the published trainer resources list is open to any signed-in user.
import { Router } from "express";
import { z } from "zod";
import { query, withTransaction } from "../db.js";
import { asyncHandler, badRequest, notFound } from "../lib/http.js";
import { requireAuth, requireTrainer } from "../middleware.js";

export const trainerRouter = Router();
trainerRouter.use(requireAuth);

trainerRouter.get(
  "/community-groups",
  requireTrainer,
  asyncHandler(async (_req, res) => {
    // Facilitator-created cohorts (which carry a join_code) live in the same
    // table but are shown in their own "My cohorts" section; here we list only
    // the network's seeded community groups.
    const { rows } = await query("select * from community_groups where join_code is null order by name");
    res.json(rows);
  }),
);

trainerRouter.get(
  "/resources",
  asyncHandler(async (req, res) => {
    const audience = req.query.audience === "learner" ? "learner" : "trainer";
    const { rows } = await query(
      "select * from resources where is_published = true and audience = $1 order by title",
      [audience],
    );
    res.json(rows);
  }),
);

trainerRouter.get(
  "/workshops",
  requireTrainer,
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      "select * from workshop_requests where trainer_id = $1 order by date",
      [req.auth!.id],
    );
    res.json(rows);
  }),
);

trainerRouter.post(
  "/workshops",
  requireTrainer,
  asyncHandler(async (req, res) => {
    const schema = z.object({
      topic: z.string().trim().min(1).max(160),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "A valid date is required"),
      venue: z.string().trim().min(1).max(200),
      expected_learners: z.coerce.number().int().min(1).max(100000).default(10),
    });
    const input = schema.safeParse(req.body);
    if (!input.success) throw badRequest("Please fill in the topic, date and venue.");
    const { topic, date, venue, expected_learners } = input.data;
    const { rows } = await query(
      `insert into workshop_requests (trainer_id, topic, date, venue, expected_learners)
       values ($1, $2, $3, $4, $5) returning *`,
      [req.auth!.id, topic, date, venue, expected_learners],
    );
    res.status(201).json(rows[0]);
  }),
);

// ---------------------------------------------------------------------------
// Cohorts: a facilitator's own groups of learners, with membership, sessions
// and attendance. Every cohort read/write below is scoped to the signed-in
// facilitator (trainer_id), so one facilitator never sees another's cohort.
// ---------------------------------------------------------------------------

/** Confirm the cohort exists and belongs to this facilitator; 404 otherwise. */
async function ownedCohort(groupId: string, trainerId: string) {
  const { rows } = await query<{ id: string; name: string; join_code: string | null }>(
    "select id, name, join_code from community_groups where id = $1 and trainer_id = $2",
    [groupId, trainerId],
  );
  if (!rows[0]) throw notFound("Cohort not found.");
  return rows[0];
}

/** A short, unambiguous join code (no 0/O/1/I) unique across cohorts. */
async function uniqueJoinCode(): Promise<string> {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let attempt = 0; attempt < 10; attempt++) {
    let code = "";
    for (let i = 0; i < 6; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
    const { rows } = await query("select 1 from community_groups where join_code = $1", [code]);
    if (!rows[0]) return code;
  }
  throw badRequest("Could not generate a join code. Please try again.");
}

// List the facilitator's own cohorts with a live member count.
trainerRouter.get(
  "/cohorts",
  requireTrainer,
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `select g.id, g.name, g.location, g.description, g.join_code, g.created_at,
              (select count(*)::int from cohort_members m where m.group_id = g.id) as member_count
         from community_groups g
        where g.trainer_id = $1
        order by g.created_at desc`,
      [req.auth!.id],
    );
    res.json(rows);
  }),
);

// Create a cohort (owned by this facilitator) with a fresh join code.
trainerRouter.post(
  "/cohorts",
  requireTrainer,
  asyncHandler(async (req, res) => {
    const schema = z.object({
      name: z.string().trim().min(1).max(120),
      location: z.string().trim().min(1).max(160),
      description: z.string().trim().max(500).optional().default(""),
    });
    const input = schema.safeParse(req.body);
    if (!input.success) throw badRequest("Please give the cohort a name and location.");
    const code = await uniqueJoinCode();
    const { rows } = await query(
      `insert into community_groups (name, location, description, trainer_id, join_code)
       values ($1, $2, $3, $4, $5)
       returning id, name, location, description, join_code, created_at,
                 0 as member_count`,
      [input.data.name, input.data.location, input.data.description, req.auth!.id, code],
    );
    res.status(201).json(rows[0]);
  }),
);

// Cohort detail: members with their learning progress, plus sessions.
trainerRouter.get(
  "/cohorts/:id",
  requireTrainer,
  asyncHandler(async (req, res) => {
    const cohort = await ownedCohort(String(req.params.id), req.auth!.id);
    const { rows: members } = await query(
      `select u.id as user_id,
              coalesce(p.full_name, u.email) as name,
              u.email,
              m.joined_at,
              (select count(*)::int from lesson_progress lp where lp.user_id = u.id) as lessons_completed,
              (select count(*)::int from certificates c where c.user_id = u.id) as certificates
         from cohort_members m
         join users u on u.id = m.user_id
         left join profiles p on p.id = u.id
        where m.group_id = $1
        order by name`,
      [cohort.id],
    );
    const { rows: sessions } = await query(
      `select s.id, s.title, s.session_date,
              (select count(*)::int from attendance a where a.session_id = s.id and a.present) as present_count
         from cohort_sessions s
        where s.group_id = $1
        order by s.session_date desc`,
      [cohort.id],
    );
    res.json({ cohort, members, sessions });
  }),
);

// Add a member by their account email.
trainerRouter.post(
  "/cohorts/:id/members",
  requireTrainer,
  asyncHandler(async (req, res) => {
    const cohort = await ownedCohort(String(req.params.id), req.auth!.id);
    const schema = z.object({ email: z.string().trim().toLowerCase().email() });
    const input = schema.safeParse(req.body);
    if (!input.success) throw badRequest("Enter a valid learner email.");
    const { rows: users } = await query<{ id: string }>(
      "select id from users where lower(email) = $1",
      [input.data.email],
    );
    if (!users[0]) throw notFound("No learner has that email yet. Ask them to sign up first.");
    await query(
      "insert into cohort_members (group_id, user_id) values ($1, $2) on conflict do nothing",
      [cohort.id, users[0].id],
    );
    res.status(201).json({ ok: true });
  }),
);

// Remove a member.
trainerRouter.delete(
  "/cohorts/:id/members/:userId",
  requireTrainer,
  asyncHandler(async (req, res) => {
    const cohort = await ownedCohort(String(req.params.id), req.auth!.id);
    await query("delete from cohort_members where group_id = $1 and user_id = $2", [
      cohort.id,
      String(req.params.userId),
    ]);
    res.json({ ok: true });
  }),
);

// Schedule a session for the cohort.
trainerRouter.post(
  "/cohorts/:id/sessions",
  requireTrainer,
  asyncHandler(async (req, res) => {
    const cohort = await ownedCohort(String(req.params.id), req.auth!.id);
    const schema = z.object({
      title: z.string().trim().min(1).max(160),
      session_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "A valid date is required"),
    });
    const input = schema.safeParse(req.body);
    if (!input.success) throw badRequest("Give the session a title and date.");
    const { rows } = await query(
      "insert into cohort_sessions (group_id, title, session_date) values ($1, $2, $3) returning id, title, session_date, 0 as present_count",
      [cohort.id, input.data.title, input.data.session_date],
    );
    res.status(201).json(rows[0]);
  }),
);

/** Confirm a session belongs to a cohort owned by this facilitator. */
async function ownedSession(sessionId: string, trainerId: string) {
  const { rows } = await query<{ id: string; group_id: string }>(
    `select s.id, s.group_id
       from cohort_sessions s
       join community_groups g on g.id = s.group_id
      where s.id = $1 and g.trainer_id = $2`,
    [sessionId, trainerId],
  );
  if (!rows[0]) throw notFound("Session not found.");
  return rows[0];
}

// The roster for a session: every cohort member with their current present flag.
trainerRouter.get(
  "/sessions/:id/attendance",
  requireTrainer,
  asyncHandler(async (req, res) => {
    const session = await ownedSession(String(req.params.id), req.auth!.id);
    const { rows } = await query(
      `select u.id as user_id,
              coalesce(p.full_name, u.email) as name,
              coalesce(a.present, false) as present
         from cohort_members m
         join users u on u.id = m.user_id
         left join profiles p on p.id = u.id
         left join attendance a on a.session_id = $1 and a.user_id = u.id
        where m.group_id = $2
        order by name`,
      [session.id, session.group_id],
    );
    res.json(rows);
  }),
);

// Save attendance for a session (upsert per learner).
trainerRouter.post(
  "/sessions/:id/attendance",
  requireTrainer,
  asyncHandler(async (req, res) => {
    const session = await ownedSession(String(req.params.id), req.auth!.id);
    const schema = z.object({
      entries: z
        .array(z.object({ user_id: z.string().uuid(), present: z.boolean() }))
        .max(100000),
    });
    const input = schema.safeParse(req.body);
    if (!input.success) throw badRequest("Invalid attendance data.");
    await withTransaction(async (client) => {
      for (const e of input.data.entries) {
        await client.query(
          `insert into attendance (session_id, user_id, present)
           values ($1, $2, $3)
           on conflict (session_id, user_id) do update set present = excluded.present`,
          [session.id, e.user_id, e.present],
        );
      }
    });
    res.json({ ok: true });
  }),
);
