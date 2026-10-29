import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Cookie, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useConsent } from "@/lib/consent";
import { useAuth } from "@/lib/auth";
import { usePolicyVersion } from "@/lib/content";
import { apiGet, apiPost } from "@/lib/api";

export function CookieConsentManager() {
  const { choice, ready, managerOpen, openManager, closeManager, save } = useConsent();
  const [prefs, setPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  useEffect(() => {
    if (managerOpen) {
      setPrefs(choice?.preferences ?? false);
      setAnalytics(choice?.analytics ?? false);
    }
  }, [managerOpen, choice]);

  return (
    <>
      {ready && !choice && !managerOpen && (
        <div
          role="region"
          aria-label="Cookie choices"
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm rounded-2xl border border-border bg-card p-5 shadow-lg motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500 sm:right-auto"
        >
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft">
              <Cookie className="size-5 text-primary" aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold">A few cookies?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                We use a few to keep you signed in and count visitors, you choose.{" "}
                <Link to="/privacy" className="font-semibold text-primary underline">Read more</Link>
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => save({ preferences: true, analytics: true })}>Allow all</Button>
            <Button variant="outline" size="sm" onClick={() => save({ preferences: false, analytics: false })}>Essential only</Button>
            <Button variant="ghost" size="sm" onClick={openManager}>Manage</Button>
          </div>
        </div>
      )}
      <Dialog open={managerOpen} onOpenChange={(o) => !o && closeManager()}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">Your cookie choices</DialogTitle>
            <DialogDescription>Turn on only what you are happy with. You can change this any time from the footer.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Row title="Essential" body="Keeps you signed in and remembers these choices. Always on." control={<span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground"><Lock className="size-3.5" aria-hidden="true" />Always on</span>} />
            <Row title="Preferences" body="Remembers your language and display settings." control={<Switch checked={prefs} onCheckedChange={setPrefs} aria-label="Preferences cookies" />} />
            <Row title="Analytics" body="Counts visits so we know which lessons help most. No ads." control={<Switch checked={analytics} onCheckedChange={setAnalytics} aria-label="Analytics cookies" />} />
          </div>
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => save({ preferences: false, analytics: false })}>Essential only</Button>
            <Button onClick={() => save({ preferences: prefs, analytics })}>Save my choices</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Row({ title, body, control }: { title: string; body: string; control: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{body}</p>
      </div>
      {control}
    </div>
  );
}

/** Blocks signed-in users until they acknowledge the current policy version. */
export function PolicyVersionGate() {
  const { user } = useAuth();
  const version = usePolicyVersion();
  const qc = useQueryClient();
  const { data: acked, isLoading } = useQuery({
    queryKey: ["policy-ack", user?.id, version],
    enabled: !!user && !!version,
    queryFn: async () =>
      (await apiGet<{ acked: boolean }>(`/me/consent/ack?version=${encodeURIComponent(version!)}`)).acked,
  });
  if (!user || !version || isLoading || acked !== false) return null;
  const accept = async () => {
    await apiPost("/me/consent", { type: "policy_ack", version, granted: true });
    qc.invalidateQueries({ queryKey: ["policy-ack"] });
  };
  return (
    <div className="fixed inset-0 z-[60] flex items-end bg-foreground/40" role="dialog" aria-modal="true" aria-labelledby="policy-gate-title">
      <div className="w-full border-t border-border bg-card">
        <div className="container-page flex flex-col gap-3 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p id="policy-gate-title" className="font-semibold">We have updated our Terms and Privacy Policy (version {version}).</p>
            <p className="text-sm text-muted-foreground">
              Please read the <Link to="/privacy" className="text-primary underline">Privacy Policy</Link> and{" "}
              <Link to="/terms" className="text-primary underline">Terms</Link>, then accept to keep learning.
            </p>
          </div>
          <Button onClick={accept} autoFocus>I have read and accept</Button>
        </div>
      </div>
    </div>
  );
}

/** Consent-gated analytics stub, only mounted after analytics opt-in. */
function AnalyticsTracker() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    console.info("[analytics] page view", path);
  }, [path]);
  return null;
}

export function Analytics() {
  const { choice } = useConsent();
  return choice?.analytics ? <AnalyticsTracker /> : null;
}
