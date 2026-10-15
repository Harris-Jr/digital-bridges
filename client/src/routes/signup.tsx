import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SiteLayout } from "@/components/site";
import { GoogleButton, MethodTabs, PhoneSoon } from "@/components/auth-forms";
import { ApiError, apiPost } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { usePolicyVersion } from "@/lib/content";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your free account — Digital Bridges" },
      { name: "description", content: "Join Digital Bridges for free and start learning digital skills today." },
      { property: "og:title", content: "Create your free account — Digital Bridges" },
      { property: "og:description", content: "Free digital skills lessons. Sign up in one minute." },
    ],
  }),
  component: SignUp,
});

const schema = z.object({
  name: z.string().trim().min(2, "Please tell us your name").max(100),
  district: z.string().trim().max(60),
  email: z.string().trim().email("This email does not look right").max(255),
  password: z.string().min(8, "Use at least 8 characters. A short sentence works well."),
});

function SignUp() {
  const { user, signUp } = useAuth();
  const navigate = useNavigate();
  const version = usePolicyVersion() ?? "1.0";
  const [method, setMethod] = useState<"phone" | "email">("email");
  const [f, setF] = useState({ name: "", district: "", email: "", password: "" });
  const [terms, setTerms] = useState(false);
  const [age, setAge] = useState<"" | "adult" | "minor">("");
  const [news, setNews] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (user) navigate({ to: "/dashboard", replace: true });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(f);
    const errs: Record<string, string> = r.success ? {} : Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message]));
    if (!terms) errs["terms"] = "Please agree to the Terms and Privacy Policy to continue.";
    if (!age) errs["age"] = "Please choose one of the age options.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await signUp({ email: f.email.trim(), password: f.password, full_name: f.name.trim(), district: f.district.trim() });
    } catch (err) {
      setBusy(false);
      setErrors({
        form:
          err instanceof ApiError && err.status === 409
            ? "There is already an account with this email. Try signing in."
            : "We could not create your account. Please try again.",
      });
      return;
    }
    // The account is created and signed in; record the consents given at sign-up.
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
    } catch {
      /* non-blocking: account exists even if consent logging fails */
    }
    setBusy(false);
    navigate({ to: "/dashboard", replace: true });
  };

  const field = (k: keyof typeof f, label: string, type = "text", auto = "") => (
    <div>
      <Label htmlFor={k}>{label}</Label>
      <Input id={k} type={type} autoComplete={auto} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} aria-invalid={!!errors[k]} aria-describedby={`${k}-err`} className="mt-1 h-11" />
      {errors[k] && <p id={`${k}-err`} className="mt-1 text-sm text-destructive">{errors[k]}</p>}
    </div>
  );

  return (
    <SiteLayout>
      <section className="container-page max-w-md py-12">
        <h1 className="text-3xl">Create your free account</h1>
        <p className="mt-2 text-muted-foreground">Save your progress, earn badges and pick up on any phone.</p>
        <div className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <MethodTabs method={method} setMethod={setMethod} />
          {method === "phone" ? <PhoneSoon onEmail={() => setMethod("email")} /> : (
            <form onSubmit={submit} noValidate className="space-y-4">
              {field("name", "Your name", "text", "name")}
              {field("district", "Your district (optional)", "text", "address-level2")}
              {field("email", "Email address", "email", "email")}
              {field("password", "Choose a password", "password", "new-password")}

              <fieldset className="space-y-3 rounded-xl border border-border p-4">
                <legend className="px-1 text-sm font-semibold">Before you start</legend>
                <div className="flex items-start gap-3">
                  <Checkbox id="terms" checked={terms} onCheckedChange={(v) => setTerms(v === true)} className="mt-1" aria-describedby="terms-err" />
                  <Label htmlFor="terms" className="font-normal leading-snug">
                    I agree to the <Link to="/terms" className="text-primary underline">Terms</Link> and have read the <Link to="/privacy" className="text-primary underline">Privacy Policy</Link>.
                  </Label>
                </div>
                {errors["terms"] && <p id="terms-err" className="text-sm text-destructive">{errors["terms"]}</p>}
                <RadioGroup value={age} onValueChange={(v) => setAge(v as "adult" | "minor")} aria-label="Age confirmation" className="gap-2">
                  <div className="flex items-start gap-3"><RadioGroupItem value="adult" id="adult" className="mt-1" /><Label htmlFor="adult" className="font-normal">I am 18 or older</Label></div>
                  <div className="flex items-start gap-3"><RadioGroupItem value="minor" id="minor" className="mt-1" /><Label htmlFor="minor" className="font-normal leading-snug">I am under 18 and my parent or guardian has agreed</Label></div>
                </RadioGroup>
                {errors["age"] && <p className="text-sm text-destructive">{errors["age"]}</p>}
              </fieldset>

              <div className="flex items-start gap-3">
                <Checkbox id="news" checked={news} onCheckedChange={(v) => setNews(v === true)} className="mt-1" />
                <Label htmlFor="news" className="font-normal leading-snug">Optional: email me about new lessons and workshops near me. I can stop any time.</Label>
              </div>

              {errors["form"] && <p role="alert" className="text-sm text-destructive">{errors["form"]}</p>}
              <Button type="submit" variant="accent" className="w-full" disabled={busy}>{busy ? "Creating account…" : "Create my account"}</Button>
            </form>
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
          <GoogleButton label="Continue with Google" />
          <p className="text-xs text-muted-foreground">If you use Google, we will ask you to accept the Terms when you first arrive.</p>
        </div>
        <p className="mt-4 text-sm">Already have an account? <Link to="/signin" className="font-semibold text-primary underline">Sign in</Link></p>
      </section>
    </SiteLayout>
  );
}
