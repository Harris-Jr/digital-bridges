import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "./lib/auth.js";
import { query } from "./db.js";
import { forbidden, unauthorized } from "./lib/http.js";

export type Role = "learner" | "trainer" | "editor" | "admin";

export interface AuthContext {
  id: string;
  email: string;
  roles: Role[];
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

function readBearer(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim() || null;
}

/** Populates req.auth when a valid token is present; never rejects. */
export async function loadAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = readBearer(req);
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        const { rows } = await query<{ role: Role }>(
          "select role from user_roles where user_id = $1",
          [payload.sub],
        );
        req.auth = { id: payload.sub, email: payload.email, roles: rows.map((r) => r.role) };
      }
    }
    next();
  } catch (err) {
    next(err);
  }
}

/** Requires a signed-in user. */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.auth) return next(unauthorized());
  next();
}

const STAFF: Role[] = ["editor", "admin"];
const TRAINERS: Role[] = ["trainer", "editor", "admin"];

export function requireStaff(req: Request, _res: Response, next: NextFunction): void {
  if (!req.auth) return next(unauthorized());
  if (!req.auth.roles.some((r) => STAFF.includes(r))) return next(forbidden());
  next();
}

export function requireTrainer(req: Request, _res: Response, next: NextFunction): void {
  if (!req.auth) return next(unauthorized());
  if (!req.auth.roles.some((r) => TRAINERS.includes(r))) return next(forbidden());
  next();
}
