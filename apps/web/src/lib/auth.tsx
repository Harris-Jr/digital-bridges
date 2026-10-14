import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Role = "learner" | "trainer" | "editor" | "admin";
export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  district: string | null;
  language_pref: string;
};

type AuthCtx = {
  session: Session | null;
  user: User | null;
  roles: Role[];
  profile: Profile | null;
  loading: boolean;
  isStaff: boolean;
  isTrainer: boolean;
  isAdmin: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async (s: Session | null) => {
    if (!s) {
      setRoles([]);
      setProfile(null);
      return;
    }
    const uid = s.user.id;
    const [{ data: r }, { data: p }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", uid),
      supabase.from("profiles").select("id,full_name,phone,district,language_pref").eq("id", uid).maybeSingle(),
    ]);
    setRoles(((r ?? []) as { role: Role }[]).map((x) => x.role));
    if (p) setProfile(p as Profile);
    else {
      const meta = s.user.user_metadata ?? {};
      const fresh = {
        id: uid,
        full_name: (meta["full_name"] as string) || (meta["name"] as string) || "",
        district: (meta["district"] as string) || null,
        phone: (meta["phone"] as string) || null,
        language_pref: "en",
      };
      await supabase.from("profiles").insert(fresh);
      setProfile(fresh);
    }
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        setTimeout(() => void loadUser(s), 0);
      }
    });
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      await loadUser(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadUser]);

  const value: AuthCtx = {
    session,
    user: session?.user ?? null,
    roles,
    profile,
    loading,
    isStaff: roles.includes("editor") || roles.includes("admin"),
    isTrainer: roles.includes("trainer") || roles.includes("editor") || roles.includes("admin"),
    isAdmin: roles.includes("admin"),
    refresh: () => loadUser(session),
    signOut: async () => {
      await supabase.auth.signOut();
    },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside AuthProvider");
  return c;
}
