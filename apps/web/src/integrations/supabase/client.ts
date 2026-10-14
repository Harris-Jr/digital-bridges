// TEMPORARY data layer. Removed in Stage 3, when the Express API replaces Supabase.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as
  | string
  | undefined;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. " +
      "Copy apps/web/.env.example to apps/web/.env and fill them in.",
  );
}

// New-style Supabase keys ("sb_publishable_...") are opaque strings, not JWTs, so they
// must be sent as `apikey` and never as a Bearer token.
const isOpaqueKey = (k: string) => k.startsWith("sb_publishable_") || k.startsWith("sb_secret_");

const supabaseFetch: typeof fetch = (input, init) => {
  const headers = new Headers(
    typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
  );
  if (init?.headers) new Headers(init.headers).forEach((v, k) => headers.set(k, v));
  if (isOpaqueKey(SUPABASE_PUBLISHABLE_KEY) && headers.get("Authorization") === `Bearer ${SUPABASE_PUBLISHABLE_KEY}`) {
    headers.delete("Authorization");
  }
  headers.set("apikey", SUPABASE_PUBLISHABLE_KEY);
  return fetch(input, { ...init, headers });
};

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  global: { fetch: supabaseFetch },
  auth: { persistSession: true, autoRefreshToken: true },
});
