import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, signAccessToken, verifyToken } from "./auth.js";

describe("password hashing", () => {
  it("hashes and verifies a correct password, rejects a wrong one", async () => {
    const hash = await hashPassword("correct horse battery");
    expect(hash).not.toContain("correct horse"); // never stores plaintext
    expect(await verifyPassword("correct horse battery", hash)).toBe(true);
    expect(await verifyPassword("wrong password", hash)).toBe(false);
  });
});

describe("access tokens", () => {
  it("round-trips a valid token", () => {
    const token = signAccessToken({ sub: "user-1", email: "a@b.co" });
    const payload = verifyToken(token);
    expect(payload).toEqual({ sub: "user-1", email: "a@b.co" });
  });

  it("rejects a tampered or garbage token", () => {
    expect(verifyToken("not.a.jwt")).toBeNull();
    const token = signAccessToken({ sub: "u", email: "e@x.co" });
    expect(verifyToken(token + "x")).toBeNull(); // signature broken
  });
});
