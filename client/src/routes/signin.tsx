import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteLayout } from "@/components/site";
import { GoogleButton, MethodTabs, PhoneSoon } from "@/components/auth-forms";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign in — Digital Bridges" },
      { name: "description", content: "Sign in to continue your Digital Bridges lessons." },
      { property: "og:title", content: "Sign in — Digital Bridges" },
      { property: "og:description", content: "Sign in to continue learning." },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState<"phone" | "email">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (user) navigate({ to: "/dashboard", replace: true });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!email.includes("@")) { setErr("Please type your full email address."); return; }
    if (!password) { setErr("Please type your password."); return; }
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      navigate({ to: "/dashboard", replace: true });
    } catch (e) {
      setErr(
        e instanceof ApiError && e.status === 401
          ? "That email and password do not match. Check and try again."
          : "We could not sign you in. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  };
  const reset = async () => {
    setErr("");
    if (!email.includes("@")) { setErr("Type your email above first, then tap Forgot password."); return; }
    setInfo("To reset your password, please use the Contact page and we will help you.");
  };

  return (
    <SiteLayout>
      <section className="container-page max-w-md py-12">
        <h1 className="text-3xl">Welcome back</h1>
        <p className="mt-2 text-muted-foreground">Sign in to pick up where you stopped.</p>
        <div className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <MethodTabs method={method} setMethod={setMethod} />
          {method === "phone" ? <PhoneSoon onEmail={() => setMethod("email")} /> : (
            <form onSubmit={submit} noValidate className="space-y-4">
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 h-11" />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 h-11" />
              </div>
              {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
              {info && <p role="status" className="text-sm text-success">{info}</p>}
              <Button type="submit" className="w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
              <button type="button" onClick={reset} className="min-h-11 text-sm font-semibold text-primary underline">Forgot password?</button>
            </form>
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
          <GoogleButton label="Sign in with Google" />
        </div>
        <p className="mt-4 text-sm">New here? <Link to="/signup" className="font-semibold text-primary underline">Create a free account</Link></p>
      </section>
    </SiteLayout>
  );
}
