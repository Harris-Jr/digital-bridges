// Facilitator endpoints. Reading community groups and own workshops requires a
// trainer role; the published trainer resources list is open to any signed-in user.
import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { asyncHandler, badRequest } from "../lib/http.js";
import { requireAuth, requireTrainer } from "../middleware.js";

export const trainerRouter = Router();
trainerRouter.use(requireAuth);

trainerRouter.get(
  "/community-groups",
  requireTrainer,
  asyncHandler(async (_req, res) => {
    const { rows } = await query("select * from community_groups order by name");
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
