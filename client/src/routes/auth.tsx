import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, User, X } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { UnderlineField, PasswordField, LangPill } from "@/components/auth-shell";
import { ApiError, apiPost } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { usePolicyVersion } from "@/lib/content";

type Mode = "login" | "register";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { mode?: Mode } => ({
    mode: s.mode === "register" ? "register" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Digital Bridges" },
      { name: "description", content: "Sign in or create your free Digital Bridges account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { mode } = Route.useSearch();
  const isLogin = mode !== "register";

  useEffect(() => {
    if (user) navigate({ to: "/dashboard", replace: true });
  }, [user, navigate]);

  const toggle = () =>
    navigate({ to: "/auth", search: isLogin ? { mode: "register" } : {}, replace: true });

  return (
    <div className="auth-page">
      <div className={`auth-container${isLogin ? "" : " active"}`}>
        {/* Form panel */}
        <section className="form-box">
          <div className="relative flex min-h-full items-center justify-center bg-background px-4 py-8">
            <div className="pointer-events-none absolute left-1/2 top-1/4 size-64 -translate-x-1/2 rounded-full bg-primary/25 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute bottom-[18%] right-4 size-52 rounded-full bg-accent/25 blur-3xl" aria-hidden="true" />
            <div className="glass-card glass-gloss relative w-full max-w-[380px] rounded-[20px] p-7 sm:p-8">
              <Link
                to="/"
                aria-label={t("auth.close", "Close")}
                className="absolute right-4 top-4 z-10 grid size-8 place-items-center rounded-full border border-foreground/20 text-foreground/70 transition-colors hover:border-foreground/40 hover:text-foreground"
              >
                <X className="size-4" />
              </Link>
              {isLogin ? <LoginForm key="login" onToggle={toggle} /> : <RegisterForm key="register" onToggle={toggle} />}
            </div>
          </div>
        </section>

        {/* Illustration / toggle panel */}
        <section className="toggle-box">
          <img src="/images/auth-bg-desktop.jpg" alt="" loading="eager" className="absolute inset-0 hidden h-full w-full object-cover sm:block" />
          <img src="/images/auth-bg-mobile.jpg" alt="" loading="eager" className="absolute inset-0 h-full w-full object-cover object-[center_65%] sm:hidden" />
          <div className="absolute inset-0 bg-primary/35" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 hidden h-1/2 bg-gradient-to-t from-black/65 via-black/15 to-transparent sm:block" aria-hidden="true" />

          <div className="absolute left-1/2 top-5 z-10 -translate-x-1/2">
            <LangPill onDark />
          </div>

          {/* Desktop: Welcome in the dark foreground band */}
          <div className="absolute inset-x-0 bottom-[12%] z-10 hidden px-8 text-center text-white sm:block">
            <h1 className="font-display text-5xl font-extrabold tracking-tight [text-shadow:0_2px_14px_rgba(0,0,0,0.5)] lg:text-6xl">{t("auth.welcome", "Welcome")}</h1>
            <p className="mt-3 text-xl font-medium [text-shadow:0_2px_10px_rgba(0,0,0,0.5)]">{t("auth.tagline", "Building digital bridges")}</p>
          </div>
          {/* Mobile: Welcome centred in the header */}
          <div className="absolute inset-0 z-[5] flex flex-col items-center justify-center px-6 text-center text-white sm:hidden">
            <h1 className="font-display text-3xl font-extrabold [text-shadow:0_2px_12px_rgba(0,0,0,0.55)]">{t("auth.welcome", "Welcome")}</h1>
            <p className="mt-1 text-sm font-medium [text-shadow:0_2px_10px_rgba(0,0,0,0.55)]">{t("auth.tagline", "Building digital bridges")}</p>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- login */
function LoginForm({ onToggle }: { onToggle: () => void }) {
  const { t } = useI18n();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

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
    <form onSubmit={submit} noValidate className="auth-form space-y-6">
      <h2 className="text-center font-display text-3xl font-extrabold">{t("auth.login", "Login")}</h2>
      <div className="space-y-5">
        <UnderlineField id="email" label={t("auth.email", "Phone number or email")} icon={Mail} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <PasswordField id="password" label={t("auth.password", "Password")} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div className="flex items-center justify-between text-sm">
        <label className="inline-flex cursor-pointer items-center gap-2 text-muted-foreground">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="size-[18px] accent-[var(--primary)]" />
          {t("auth.remember", "Remember me")}
        </label>
        <button type="button" onClick={reset} className="font-semibold text-primary hover:underline">{t("auth.forgot", "Forgot Password?")}</button>
      </div>
      {err && <p role="alert" className="text-sm font-semibold text-destructive">{err}</p>}
      {info && <p role="status" className="text-sm font-medium text-success">{info}</p>}
      <Button type="submit" className="min-h-12 w-full" size="lg" disabled={busy || !email || !password}>
        {busy ? t("auth.loggingin", "Logging in…") : t("auth.login", "Login")}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {t("auth.noaccount", "Don't have an account?")}{" "}
        <button type="button" onClick={onToggle} className="font-bold text-primary hover:underline">{t("auth.register", "Register")}</button>
      </p>
    </form>
  );
}

/* -------------------------------------------------------------- register */
const schema = z.object({
  first: z.string().trim().min(1, "Please tell us your name").max(60),
  last: z.string().trim().max(60),
  email: z.string().trim().email("This email does not look right").max(255),
  password: z.string().min(8, "Use at least 8 characters. A short sentence works well."),
});

function RegisterForm({ onToggle }: { onToggle: () => void }) {
  const { t } = useI18n();
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const version = usePolicyVersion() ?? "1.0";
  const [f, setF] = useState({ first: "", last: "", email: "", password: "", confirm: "" });
  const [terms, setTerms] = useState(false);
  const [age, setAge] = useState<"" | "adult" | "minor">("");
  const [news, setNews] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(f);
    const errs: Record<string, string> = r.success ? {} : Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message]));
    if (f.confirm !== f.password) errs["confirm"] = t("auth.err.match", "Passwords do not match.");
    if (!terms) errs["terms"] = t("auth.err.terms", "Please agree to the Terms and Privacy Policy to continue.");
    if (!age) errs["age"] = t("auth.err.age", "Please choose one of the age options.");
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    try {
      await signUp({ email: f.email.trim(), password: f.password, full_name: `${f.first} ${f.last}`.trim() });
    } catch (err) {
      setBusy(false);
      setErrors({ form: err instanceof ApiError && err.status === 409
        ? t("auth.err.exists", "There is already an account with this email. Try signing in.")
        : t("auth.err.create", "We could not create your account. Please try again.") });
      return;
    }
    const consents = [
      { type: "terms" as const, version, granted: true, details: { accepted: ["terms", "privacy"] } },
      { type: "age" as const, version, granted: true, details: { status: age === "adult" ? "18_or_older" : "under_18_guardian_agreed" } },
    ];
    try {
      await apiPost("/me/consent", consents);
      if (news) {
        await apiPost("/newsletter", { email: f.email.trim() }, false);
        await apiPost("/me/consent", { type: "newsletter", version, granted: true });
      }
    } catch { /* non-blocking */ }
    setBusy(false);
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <form onSubmit={submit} noValidate className="auth-form no-scrollbar max-h-[calc(100dvh-10rem)] space-y-5 overflow-y-auto pr-1 sm:max-h-[66vh]">
      <h2 className="text-center font-display text-3xl font-extrabold">{t("auth.create", "Create Account")}</h2>
      <div className="grid grid-cols-2 gap-3">
        <UnderlineField id="first" label={t("auth.first", "First name")} icon={User} autoComplete="given-name" value={f.first} onChange={set("first")} error={errors["first"]} />
        <UnderlineField id="last" label={t("auth.last", "Last name")} autoComplete="family-name" value={f.last} onChange={set("last")} error={errors["last"]} />
      </div>
      <UnderlineField id="email" label={t("auth.email", "Email address")} icon={Mail} type="email" autoComplete="email" value={f.email} onChange={set("email")} error={errors["email"]} />
      <PasswordField id="password" label={t("auth.password", "Password")} autoComplete="new-password" value={f.password} onChange={set("password")} error={errors["password"]} />
      <PasswordField id="confirm" label={t("auth.confirm", "Confirm password")} autoComplete="new-password" value={f.confirm} onChange={set("confirm")} error={errors["confirm"]} />

      <fieldset className="space-y-2 rounded-xl border border-foreground/15 p-3 text-sm">
        <label className="flex items-start gap-2.5">
          <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 size-[18px] shrink-0 accent-[var(--primary)]" />
          <span className="leading-snug">
            {t("auth.agree", "I agree to the")} <Link to="/terms" className="text-primary underline">{t("auth.terms", "Terms")}</Link> {t("auth.and", "and")} <Link to="/privacy" className="text-primary underline">{t("auth.privacy", "Privacy Policy")}</Link>.
          </span>
        </label>
        {errors["terms"] && <p className="font-semibold text-destructive">{errors["terms"]}</p>}
        <div className="flex flex-col gap-2 pt-1">
          <label className="flex items-start gap-2.5"><input type="radio" name="age" checked={age === "adult"} onChange={() => setAge("adult")} className="mt-0.5 size-[18px] shrink-0 accent-[var(--primary)]" /><span className="leading-snug">{t("auth.adult", "I am 18 or older")}</span></label>
          <label className="flex items-start gap-2.5"><input type="radio" name="age" checked={age === "minor"} onChange={() => setAge("minor")} className="mt-0.5 size-[18px] shrink-0 accent-[var(--primary)]" /><span className="leading-snug">{t("auth.minor", "I am under 18 and my parent or guardian has agreed")}</span></label>
        </div>
        {errors["age"] && <p className="font-semibold text-destructive">{errors["age"]}</p>}
      </fieldset>

      <label className="flex items-start gap-2.5 text-sm text-muted-foreground">
        <input type="checkbox" checked={news} onChange={(e) => setNews(e.target.checked)} className="mt-0.5 size-[18px] shrink-0 accent-[var(--primary)]" />
        <span className="leading-snug">{t("auth.news", "Optional: email me about new lessons and workshops near me.")}</span>
      </label>

      {errors["form"] && <p role="alert" className="text-sm font-semibold text-destructive">{errors["form"]}</p>}

      <Button type="submit" variant="accent" className="min-h-12 w-full" size="lg" disabled={busy}>
        {busy ? t("auth.creating", "Creating account…") : t("auth.create", "Create Account")}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {t("auth.haveaccount", "Already have an account?")}{" "}
        <button type="button" onClick={onToggle} className="font-bold text-primary hover:underline">{t("auth.login", "Login")}</button>
      </p>
    </form>
  );
}
