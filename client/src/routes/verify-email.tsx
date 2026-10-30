import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site";
import { apiPost } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/verify-email")({
  validateSearch: (s: Record<string, unknown>): { token?: string } => ({
    token: typeof s.token === "string" ? s.token : undefined,
  }),
  head: () => seo({ path: "/verify-email", title: "Confirm your email | Civic Wise", description: "Confirm your Civic Wise email address.", noindex: true }),
  component: VerifyEmail,
});

function VerifyEmail() {
  const { token } = Route.useSearch();
  const { t } = useI18n();
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    if (!token) { setState("error"); return; }
    let active = true;
    apiPost("/auth/verify-email", { token }, false)
      .then(() => { if (active) setState("ok"); })
      .catch(() => { if (active) setState("error"); });
    return () => { active = false; };
  }, [token]);

  return (
    <SiteLayout>
      <section className="container-page flex min-h-[55vh] flex-col items-center justify-center py-16 text-center">
        {state === "loading" && (
          <>
            <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
            <p className="mt-4 text-muted-foreground">{t("verify.checking", "Confirming your email...")}</p>
          </>
        )}
        {state === "ok" && (
          <>
            <CheckCircle2 className="size-12 text-success" aria-hidden="true" />
            <h1 className="mt-4 text-3xl text-primary">{t("verify.ok.title", "Email confirmed")}</h1>
            <p className="mt-2 max-w-md text-muted-foreground">{t("verify.ok.body", "Thank you. Your email address is now confirmed.")}</p>
            <Button asChild className="mt-6"><Link to="/dashboard">{t("verify.ok.cta", "Go to my learning")}</Link></Button>
          </>
        )}
        {state === "error" && (
          <>
            <XCircle className="size-12 text-destructive" aria-hidden="true" />
            <h1 className="mt-4 text-3xl text-primary">{t("verify.err.title", "Link invalid or expired")}</h1>
            <p className="mt-2 max-w-md text-muted-foreground">{t("verify.err.body", "This confirmation link is invalid or has expired. Sign in and request a new one.")}</p>
            <Button asChild className="mt-6"><Link to="/signin">{t("verify.err.cta", "Sign in")}</Link></Button>
          </>
        )}
      </section>
    </SiteLayout>
  );
}
