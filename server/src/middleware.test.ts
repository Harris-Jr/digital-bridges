import { describe, it, expect } from "vitest";
import type { Request, Response } from "express";
import { requireAuth, requireStaff, requireTrainer, type Role } from "./middleware.js";
import { HttpError } from "./lib/http.js";

// Build a fake request with the given roles (or no auth).
function reqWith(roles: Role[] | null): Request {
  return (roles ? { auth: { id: "u1", email: "u@x.co", roles } } : {}) as unknown as Request;
}
// Capture what next() was called with.
function run(mw: (req: Request, res: Response, next: (e?: unknown) => void) => void, roles: Role[] | null) {
  let error: unknown;
  let passed = false;
  mw(reqWith(roles), {} as Response, (e?: unknown) => { if (e) error = e; else passed = true; });
  return { error, passed };
}

describe("requireAuth", () => {
  it("passes a signed-in user", () => {
    const { passed, error } = run(requireAuth, ["learner"]);
    expect(passed).toBe(true);
    expect(error).toBeUndefined();
  });
  it("rejects an anonymous request with 401", () => {
    const { passed, error } = run(requireAuth, null);
    expect(passed).toBe(false);
    expect((error as HttpError).status).toBe(401);
  });
});

describe("requireStaff", () => {
  it("allows editor and admin", () => {
    expect(run(requireStaff, ["editor"]).passed).toBe(true);
    expect(run(requireStaff, ["admin"]).passed).toBe(true);
  });
  it("forbids a plain learner with 403", () => {
    const { passed, error } = run(requireStaff, ["learner"]);
    expect(passed).toBe(false);
    expect((error as HttpError).status).toBe(403);
  });
  it("forbids a trainer who is not staff", () => {
    expect((run(requireStaff, ["trainer"]).error as HttpError).status).toBe(403);
  });
  it("401s when not signed in", () => {
    expect((run(requireStaff, null).error as HttpError).status).toBe(401);
  });
});

describe("requireTrainer", () => {
  it("allows trainer, editor, admin", () => {
    expect(run(requireTrainer, ["trainer"]).passed).toBe(true);
    expect(run(requireTrainer, ["editor"]).passed).toBe(true);
    expect(run(requireTrainer, ["admin"]).passed).toBe(true);
  });
  it("forbids a plain learner with 403", () => {
    expect((run(requireTrainer, ["learner"]).error as HttpError).status).toBe(403);
  });
});
