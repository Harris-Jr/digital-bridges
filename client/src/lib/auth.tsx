import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { api, apiPost, clearTokens, getToken, setTokens, TOKEN_KEY } from "@/lib/api";

export type Role = "learner" | "trainer" | "editor" | "admin";

export type User = { id: string; email: string; email_verified?: boolean };
export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  district: string | null;
  language_pref: string;
};

type Session = { accessToken: string; user: User; profile: Profile | null; roles: Role[] };
type MeResponse = { user: User; profile: Profile | null; roles: Role[] };

type AuthCtx = {
  user: User | null;
  roles: Role[];
  profile: Profile | null;
  loading: boolean;
  isStaff: boolean;
  isTrainer: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: { email: string; password: string; full_name: string; district?: string }) => Promise<Session>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const qc = useQueryClient();
  const router = useRouter();

  const apply = (s: { user: User; profile: Profile | null; roles: Role[] }) => {
    setUser(s.user);
    setProfile(s.profile);
    setRoles(s.roles);
  };

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setProfile(null);
      setRoles([]);
      return;
    }
    try {
      const me = await api<MeResponse>("/auth/me");
      apply(me);
    } catch {
      clearTokens();
      setUser(null);
      setProfile(null);
      setRoles([]);
    }
  }, []);

  useEffect(() => {
    void refresh().finally(() => setLoading(false));
  }, [refresh]);

  const signIn = async (email: string, password: string) => {
    const s = await apiPost<Session>("/auth/login", { email, password }, false);
    setTokens(s);
    apply(s);
  };

  const signUp = async (input: { email: string; password: string; full_name: string; district?: string }) => {
    const s = await apiPost<Session>("/auth/signup", input, false);
    setTokens(s);
    apply(s);
    return s;
  };

  // Wipe everything that belonged to the signed-in user from memory: the
  // react-query cache (progress, badges, cohorts, admin lists) and auth state.
  // Shared phones and community-centre PCs are common, so the next person must
  // never see the previous person's data, even for a single render.
  const wipeLocal = useCallback(async () => {
    clearTokens();
    await qc.cancelQueries();
    qc.clear();
    setUser(null);
    setProfile(null);
    setRoles([]);
  }, [qc]);

  const signOut = async () => {
    // Revoke the refresh token server-side (it reads the HttpOnly cookie) and
    // clear the cookie, so it can never be reused.
    try { await apiPost("/auth/logout", undefined, false); } catch { /* best effort */ }
    await wipeLocal();
    // Always leave the private area; private routes are never rendered signed out.
    await router.navigate({ to: "/signin", replace: true });
  };

  // Signing out in one tab signs out every other open tab too.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY && e.newValue === null) {
        void wipeLocal().then(() => router.navigate({ to: "/signin", replace: true }));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [wipeLocal, router]);

  const value: AuthCtx = {
    user,
    roles,
    profile,
    loading,
    isStaff: roles.includes("editor") || roles.includes("admin"),
    isTrainer: roles.includes("trainer") || roles.includes("editor") || roles.includes("admin"),
    isAdmin: roles.includes("admin"),
    signIn,
    signUp,
    signOut,
    refresh,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside AuthProvider");
  return c;
}
