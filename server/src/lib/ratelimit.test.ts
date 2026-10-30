import { describe, it, expect } from "vitest";
import { allow } from "./ratelimit.js";

describe("rate limiter allow()", () => {
  it("permits up to max within the window, then blocks", () => {
    const key = `k-${Math.random()}`;
    const max = 3;
    const win = 60_000;
    expect(allow(key, max, win)).toBe(true);
    expect(allow(key, max, win)).toBe(true);
    expect(allow(key, max, win)).toBe(true);
    expect(allow(key, max, win)).toBe(false); // 4th blocked
    expect(allow(key, max, win)).toBe(false);
  });

  it("keeps separate counters per key", () => {
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;
    expect(allow(a, 1, 60_000)).toBe(true);
    expect(allow(a, 1, 60_000)).toBe(false);
    // b is unaffected by a's exhaustion
    expect(allow(b, 1, 60_000)).toBe(true);
  });

  it("forgets hits older than the window", async () => {
    const key = `w-${Math.random()}`;
    expect(allow(key, 1, 20)).toBe(true);
    expect(allow(key, 1, 20)).toBe(false);
    await new Promise((r) => setTimeout(r, 40));
    expect(allow(key, 1, 20)).toBe(true); // window elapsed, allowed again
  });
});
