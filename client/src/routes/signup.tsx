import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, User } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { AuthShell, UnderlineField, PasswordField } from "@/components/auth-shell";
import { ApiError, apiPost } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { usePolicyVersion } from "@/lib/content";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your free account — Digital Bridges" },
      { name: "description", content: "Join Digital Bridges for free and start learning digital skills today." },
    ],
  }),
  component: SignUp,
});

const schema = z.object({
  first: z.string().trim().min(1, "Please tell us your name").max(60),
  last: z.string().trim().max(60),
  email: z.string().trim().email("This email does not look right").max(255),
  password: z.string().min(8, "Use at least 8 characters. A short sentence works well."),
});

function SignUp() {
  const { t } = useI18n();
  const { user, signUp } = useAuth();
  const navigate = useNavigate();
  const version = usePolicyVersion() ?? "1.0";
  const [f, setF] = useState({ first: "", last: "", email: "", password: "", confirm: "" });
  const [terms, setTerms] = useState(false);
  const [age, setAge] = useState<"" | "adult" | "minor">("");
  const [news, setNews] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard", replace: true });
  }, [user, navigate]);

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
    <AuthShell>
      <form onSubmit={submit} noValidate className="no-scrollbar max-h-[calc(100vh-7rem)] space-y-5 overflow-y-auto pr-1">
        <h2 className="text-center font-display text-3xl font-extrabold">{t("auth.create", "Create Account")}</h2>

        <div className="grid grid-cols-2 gap-3">
          <UnderlineField id="first" label={t("auth.first", "First name")} icon={User} autoComplete="given-name" value={f.first} onChange={set("first")} error={errors["first"]} />
          <UnderlineField id="last" label={t("auth.last", "Last name")} autoComplete="family-name" value={f.last} onChange={set("last")} error={errors["last"]} />
        </div>
        <UnderlineField id="email" label={t("auth.email", "Email address")} icon={Mail} type="email" autoComplete="email" value={f.email} onChange={set("email")} error={errors["email"]} />
        <PasswordField id="password" label={t("auth.password", "Password")} autoComplete="new-password" value={f.password} onChange={set("password")} error={errors["password"]} />
        <PasswordField id="confirm" label={t("auth.confirm", "Confirm password")} autoComplete="new-password" value={f.confirm} onChange={set("confirm")} error={errors["confirm"]} />

        <fieldset className="space-y-2 rounded-xl border border-foreground/15 p-3 text-sm">
          <label className="flex items-start gap-2">
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 size-4 accent-[var(--primary)]" />
            <span className="leading-snug">
              {t("auth.agree", "I agree to the")} <Link to="/terms" className="text-primary underline">{t("auth.terms", "Terms")}</Link> {t("auth.and", "and")} <Link to="/privacy" className="text-primary underline">{t("auth.privacy", "Privacy Policy")}</Link>.
            </span>
          </label>
          {errors["terms"] && <p className="font-semibold text-destructive">{errors["terms"]}</p>}
          <div className="flex flex-col gap-1.5 pt-1">
            <label className="flex items-center gap-2"><input type="radio" name="age" checked={age === "adult"} onChange={() => setAge("adult")} className="size-4 accent-[var(--primary)]" />{t("auth.adult", "I am 18 or older")}</label>
            <label className="flex items-start gap-2"><input type="radio" name="age" checked={age === "minor"} onChange={() => setAge("minor")} className="mt-0.5 size-4 accent-[var(--primary)]" /><span className="leading-snug">{t("auth.minor", "I am under 18 and my parent or guardian has agreed")}</span></label>
          </div>
          {errors["age"] && <p className="font-semibold text-destructive">{errors["age"]}</p>}
        </fieldset>

        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={news} onChange={(e) => setNews(e.target.checked)} className="mt-0.5 size-4 accent-[var(--primary)]" />
          <span className="leading-snug">{t("auth.news", "Optional: email me about new lessons and workshops near me.")}</span>
        </label>

        {errors["form"] && <p role="alert" className="text-sm font-semibold text-destructive">{errors["form"]}</p>}

        <Button type="submit" variant="accent" className="w-full" size="lg" disabled={busy}>
          {busy ? t("auth.creating", "Creating account…") : t("auth.create", "Create Account")}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {t("auth.haveaccount", "Already have an account?")}{" "}
          <Link to="/signin" className="font-bold text-primary hover:underline">{t("auth.login", "Login")}</Link>
        </p>
      </form>
    </AuthShell>
  );
}
