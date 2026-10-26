// Thin REST client for the Digital Bridges API. Same-origin in production;
// Vite proxies /api to the Express server in development.
//
// Auth: a short-lived access token plus a long-lived refresh token, both in
// localStorage. When a request gets a 401 and a refresh token is present, the
// client silently exchanges it for a new access token (once, shared across any
// concurrent requests) and retries, so sessions do not drop every few minutes.
const TOKEN_KEY = "db_token";
const REFRESH_KEY = "db_refresh";

export function getToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
export function getRefresh(): string | null {
  try { return localStorage.getItem(REFRESH_KEY); } catch { return null; }
}

export function setToken(token: string): void {
  try { localStorage.setItem(TOKEN_KEY, token); } catch { /* storage unavailable */ }
}

/** Store an access + refresh token pair from a login/signup/refresh response. */
export function setTokens(t: { accessToken: string; refreshToken?: string }): void {
  try {
    localStorage.setItem(TOKEN_KEY, t.accessToken);
    if (t.refreshToken) localStorage.setItem(REFRESH_KEY, t.refreshToken);
  } catch { /* storage unavailable */ }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  } catch { /* ignore */ }
}
export const clearTokens = clearToken;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type Options = { method?: string; body?: unknown; auth?: boolean };

// One in-flight refresh shared by all callers, so a burst of 401s triggers a
// single /auth/refresh rather than a stampede.
let refreshing: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  const refreshToken = getRefresh();
  if (!refreshToken) return false;
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) { clearTokens(); return false; }
    const data = (await res.json()) as { accessToken: string; refreshToken: string };
    setTokens(data);
    return true;
  } catch {
    return false;
  }
}

export async function api<T = unknown>(path: string, opts: Options = {}): Promise<T> {
  const body = opts.body !== undefined ? JSON.stringify(opts.body) : undefined;
  const send = () => {
    const headers: Record<string, string> = {};
    if (opts.body !== undefined) headers["Content-Type"] = "application/json";
    if (opts.auth !== false) {
      const token = getToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }
    return fetch(`/api${path}`, { method: opts.method ?? "GET", headers, body });
  };

  let res = await send();

  // Access token likely expired: refresh once (shared) and retry the request.
  if (res.status === 401 && opts.auth !== false && path !== "/auth/refresh" && getRefresh()) {
    if (!refreshing) refreshing = doRefresh().finally(() => { refreshing = null; });
    const ok = await refreshing;
    if (ok) res = await send();
  }

  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : "Something went wrong. Please try again.";
    throw new ApiError(res.status, message);
  }
  return data as T;
}

export const apiGet = <T = unknown>(path: string, auth?: boolean) => api<T>(path, { auth });
export const apiPost = <T = unknown>(path: string, body?: unknown, auth?: boolean) =>
  api<T>(path, { method: "POST", body, auth });
export const apiPatch = <T = unknown>(path: string, body?: unknown) =>
  api<T>(path, { method: "PATCH", body });
export const apiPut = <T = unknown>(path: string, body?: unknown) =>
  api<T>(path, { method: "PUT", body });
export const apiDelete = <T = unknown>(path: string) => api<T>(path, { method: "DELETE" });
