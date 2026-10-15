import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { asyncHandler, badRequest } from "../lib/http.js";
import { requireAuth } from "../middleware.js";

export const profileRouter = Router();
profileRouter.use(requireAuth);

const schema = z.object({
  full_name: z.string().trim().max(100).optional(),
  phone: z.string().trim().max(40).nullish(),
  district: z.string().trim().max(60).nullish(),
  language_pref: z.enum(["en", "bem", "nya"]).optional(),
});

profileRouter.patch(
  "/",
  asyncHandler(async (req, res) => {
    const input = schema.safeParse(req.body);
    if (!input.success) throw badRequest("Please check the details you entered.");

    const fields = input.data;
    const sets: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    for (const [key, value] of Object.entries(fields)) {
      if (value === undefined) continue;
      sets.push(`${key} = $${i++}`);
      values.push(value);
    }
    sets.push(`updated_at = now()`);
    values.push(req.auth!.id);

    const { rows } = await query(
      `update profiles set ${sets.join(", ")} where id = $${i}
       returning id, full_name, phone, district, language_pref`,
      values,
    );
    res.json(rows[0] ?? null);
  }),
);
