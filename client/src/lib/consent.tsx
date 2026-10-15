import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiPost } from "@/lib/api";
import { useAuth } from "@/lib/auth";
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
  const { user } = useAuth();

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
    // Signed-in consent attaches to the user; anonymous consent is recorded
    // against the public endpoint. Never block the UI on this network call.
    const payload = {
      type: "cookies" as const,
      version: next.version,
      granted: c.analytics || c.preferences,
      details: { essential: true, preferences: c.preferences, analytics: c.analytics },
    };
    try {
      await apiPost(user ? "/me/consent" : "/consent", payload);
    } catch {
      /* best-effort: the local choice is already saved */
    }
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
