// Password hashing (bcrypt) and stateless JWT session tokens.
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../env.js";

const SALT_ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export type TokenPayload = { sub: string; email: string };

/** Sign a short-lived access token (the client refreshes it when it expires). */
export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.ACCESS_TOKEN_TTL } as jwt.SignOptions);
}

/** @deprecated use signAccessToken. Kept so older imports still compile. */
export const signToken = signAccessToken;

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (typeof decoded === "object" && decoded && "sub" in decoded && "email" in decoded) {
      return { sub: String(decoded.sub), email: String((decoded as jwt.JwtPayload).email) };
    }
    return null;
  } catch {
    return null;
  }
}
