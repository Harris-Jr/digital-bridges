// Tiny in-memory sliding-window rate limiter keyed by a string (usually IP).
// No external dependency: fine for a single-process API on one VPS. If the API
// is ever scaled to multiple processes, swap this for a shared store (Redis).
import type { Request, Response, NextFunction } from "express";

type Hit = number[]; // timestamps (ms) within the window
const buckets = new Map<string, Hit>();

// Occasionally drop stale buckets so the map does not grow without bound.
let lastSweep = 0;
function sweep(now: number, windowMs: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, hits] of buckets) {
    if (hits.length === 0 || hits[hits.length - 1]! < now - windowMs) buckets.delete(key);
  }
}

/**
 * Allow at most `max` requests per `windowMs` per key. Returns true if allowed
 * (and records the hit), false if the caller is over the limit.
 */
export function allow(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  sweep(now, windowMs);
  const hits = (buckets.get(key) ?? []).filter((t) => t > now - windowMs);
  if (hits.length >= max) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  return true;
}

/** Express middleware: rate-limit by client IP. 429 when over the limit.
 *  `name` namespaces the bucket so independent limiters (e.g. burst vs daily)
 *  on the same route never share a counter. */
export function rateLimit(opts: { name: string; max: number; windowMs: number; message?: string }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${opts.name}:${req.ip ?? "unknown"}:${req.baseUrl}${req.path}`;
    if (allow(key, opts.max, opts.windowMs)) return next();
    res.status(429).json({ error: opts.message ?? "Too many requests. Please slow down and try again shortly." });
  };
}
