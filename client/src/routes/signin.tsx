import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthShell, UnderlineField, PasswordField } from "@/components/auth-shell";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign in — Digital Bridges" },
      { name: "description", content: "Sign in to continue your Digital Bridges lessons." },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const { t } = useI18n();
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard", replace: true });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!email.includes("@")) { setErr(t("auth.err.email", "Please type your full email address.")); return; }
    if (!password) { setErr(t("auth.err.password", "Please type your password.")); return; }
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      navigate({ to: "/dashboard", replace: true });
    } catch (e2) {
      setErr(
        e2 instanceof ApiError && e2.status === 401
          ? t("auth.err.nomatch", "That email and password do not match. Check and try again.")
          : t("auth.err.network", "We could not sign you in. Check your connection and try again."),
      );
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setErr("");
    if (!email.includes("@")) { setErr(t("auth.err.emailfirst", "Type your email above first, then tap Forgot password.")); return; }
    setInfo(t("auth.reset.info", "To reset your password, please use the Contact page and we will help you."));
  };

  return (
    <AuthShell>
      <form onSubmit={submit} noValidate className="space-y-6">
        <h2 className="text-center font-display text-3xl font-extrabold">{t("auth.login", "Login")}</h2>

        <div className="space-y-5">
          <UnderlineField
            id="email"
            label={t("auth.email", "Phone number or email")}
            icon={Mail}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PasswordField
            id="password"
            label={t("auth.password", "Password")}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="inline-flex cursor-pointer items-center gap-2 text-muted-foreground">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="size-4 accent-[var(--primary)]" />
            {t("auth.remember", "Remember me")}
          </label>
          <button type="button" onClick={reset} className="font-semibold text-primary hover:underline">
            {t("auth.forgot", "Forgot Password?")}
          </button>
        </div>

        {err && <p role="alert" className="text-sm font-semibold text-destructive">{err}</p>}
        {info && <p role="status" className="text-sm font-medium text-success">{info}</p>}

        <Button type="submit" className="w-full" size="lg" disabled={busy || !email || !password}>
          {busy ? t("auth.loggingin", "Logging in…") : t("auth.login", "Login")}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {t("auth.noaccount", "Don't have an account?")}{" "}
          <Link to="/signup" className="font-bold text-primary hover:underline">{t("auth.register", "Register")}</Link>
        </p>
      </form>
    </AuthShell>
  );
}
