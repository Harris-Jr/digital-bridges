import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePolicyVersion } from "@/lib/content";

export type CookieChoice = { essential: true; preferences: boolean; analytics: boolean; version: string; at: string };
type Ctx = {
  choice: CookieChoice | null;
  ready: boolean;
  managerOpen: boolean;
  openManager: () => void;
  closeManager: () => void;
  save: (c: { preferences: boolean; analytics: boolean }) => Promise<void>;
  policyVersion: string | null;
};
const ConsentCtx = createContext<Ctx | null>(null);
const KEY = "db_cookie_consent";

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [choice, setChoice] = useState<CookieChoice | null>(null);
  const [ready, setReady] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);
  const policyVersion = usePolicyVersion();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setChoice(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const save = async (c: { preferences: boolean; analytics: boolean }) => {
    const next: CookieChoice = { essential: true, ...c, version: policyVersion ?? "1.0", at: new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify(next));
    setChoice(next);
    setManagerOpen(false);
    const { data } = await supabase.auth.getUser();
    await supabase.from("consent_records").insert({
      user_id: data.user?.id ?? null,
      type: "cookies",
      version: next.version,
      granted: c.analytics || c.preferences,
      details: { essential: true, preferences: c.preferences, analytics: c.analytics },
    });
  };

  const stale = !!choice && !!policyVersion && choice.version !== policyVersion;
  return (
    <ConsentCtx.Provider
      value={{
        choice: stale ? null : choice,
        ready,
        managerOpen,
        openManager: () => setManagerOpen(true),
        closeManager: () => setManagerOpen(false),
        save,
        policyVersion,
      }}
    >
      {children}
    </ConsentCtx.Provider>
  );
}

export function useConsent() {
  const c = useContext(ConsentCtx);
  if (!c) throw new Error("useConsent outside provider");
  return c;
}
