import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/auth-shell";
import { apiPost } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (s: Record<string, unknown>): { token?: string } => ({
    token: typeof s.token === "string" ? s.token : undefined,
  }),
  head: () => ({ meta: [{ title: "Reset password, Civic Wise" }] }),
  component: ResetPassword,
});

function ResetPassword() {
  const { t } = useI18n();
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!token) { setErr(t("reset.notoken", "This reset link is missing its code. Please use the link from your email.")); return; }
    if (password.length < 8) { setErr(t("reset.short", "Use at least 8 characters.")); return; }
    if (password !== confirm) { setErr(t("auth.err.match", "Passwords do not match.")); return; }
    setBusy(true);
    try {
      await apiPost("/auth/reset-password", { token, password }, false);
      setDone(true);
      setTimeout(() => navigate({ to: "/auth" }), 2500);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : t("reset.failed", "We could not reset your password. The link may have expired."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-background px-5 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-7 shadow-sm">
        {done ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto size-10 text-success" aria-hidden="true" />
            <h1 className="mt-3 text-2xl">{t("reset.doneTitle", "Password changed")}</h1>
            <p className="mt-2 text-muted-foreground">{t("reset.doneBody", "You can now sign in with your new password.")}</p>
            <Button asChild className="mt-5 w-full"><Link to="/auth">{t("auth.login", "Login")}</Link></Button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-5">
            <div>
              <h1 className="text-2xl">{t("reset.title", "Set a new password")}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{t("reset.sub", "Choose a new password for your account.")}</p>
            </div>
            <PasswordField id="password" label={t("auth.password", "Password")} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <PasswordField id="confirm" label={t("auth.confirm", "Confirm password")} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            {err && <p role="alert" className="text-sm font-semibold text-destructive">{err}</p>}
            <Button type="submit" className="w-full" size="lg" disabled={busy}>
              {busy ? t("reset.saving", "Saving…") : t("reset.save", "Reset password")}
            </Button>
            <p className="text-center text-sm text-muted-foreground"><Link to="/auth" className="font-semibold text-primary hover:underline">{t("reset.back", "Back to sign in")}</Link></p>
          </form>
        )}
      </div>
    </div>
  );
}
