import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BadgeCheck, CheckCircle2, Loader2, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout, Icon } from "@/components/site";
import { apiGet } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

/* Public verification page for a shared badge or certificate. Anyone with the
   link can confirm the achievement is real. Shows only what the learner chose to
   share: their name, the achievement and the date. */
export const Route = createFileRoute("/verify/$kind/$id")({
  head: () => ({
    meta: [
      { title: "Verified achievement | Civic Wise" },
      { name: "description", content: "A verified achievement earned on Civic Wise, free digital and civic skills for Zambia." },
      { name: "robots", content: "noindex, follow" },
      { property: "og:title", content: "Verified achievement on Civic Wise" },
      { property: "og:description", content: "Earned on Civic Wise, free digital and civic skills for Zambia." },
    ],
  }),
  component: VerifyPage,
});

type Credential = {
  kind: "badge" | "certificate";
  learner_name: string;
  title: string;
  description?: string;
  icon_name?: string;
  course_slug?: string;
  outcomes?: string[];
  issued_at: string;
  serial: string;
};

function VerifyPage() {
  const { kind, id } = Route.useParams();
  const { t } = useI18n();
  const valid = kind === "badge" || kind === "certificate";
  const q = useQuery({
    queryKey: ["verify", kind, id],
    enabled: valid,
    retry: false,
    queryFn: () => apiGet<Credential>(`/verify/${kind}/${id}`, false),
  });

  return (
    <SiteLayout>
      <section className="container-page max-w-2xl py-12 md:py-20">
        {valid && q.isLoading ? (
          <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground" aria-label="Loading" /></div>
        ) : !valid || q.isError || !q.data ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <ShieldX className="mx-auto size-10 text-muted-foreground" aria-hidden="true" />
            <h1 className="mt-4 text-2xl">{t("verify.notfound", "We could not verify this")}</h1>
            <p className="mt-2 text-muted-foreground">{t("verify.notfoundBody", "The link may be wrong, or the learner has stopped sharing it.")}</p>
            <Button asChild className="mt-6"><Link to="/courses">{t("verify.browse", "Browse free courses")}</Link></Button>
          </div>
        ) : (
          <Verified c={q.data} />
        )}
      </section>
    </SiteLayout>
  );
}

function Verified({ c }: { c: Credential }) {
  const { t } = useI18n();
  const date = new Date(c.issued_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-2 bg-success/10 px-6 py-3 text-sm font-semibold text-success">
          <BadgeCheck className="size-5" aria-hidden="true" />
          {t("verify.ok", "Verified by Civic Wise")}
        </div>
        <div className="p-6 text-center md:p-10">
          <div className="relative mx-auto size-28">
            <svg viewBox="0 0 64 64" className="size-28" aria-hidden="true">
              <polygon points="32,2 58,17 58,47 32,62 6,47 6,17" className="fill-accent" />
              <polygon points="32,10 51,21 51,43 32,54 13,43 13,21" className="fill-primary" />
            </svg>
            <span className="absolute inset-0 grid place-items-center">
              {c.kind === "badge" ? <Icon name={c.icon_name} className="size-10 text-accent" /> : <CheckCircle2 className="size-10 text-accent" aria-hidden="true" />}
            </span>
          </div>
          <p className="mt-6 eyebrow">{c.kind === "badge" ? t("verify.badge", "Badge earned") : t("verify.cert", "Certificate of completion")}</p>
          <h1 className="mt-2 text-3xl md:text-4xl">{c.title}</h1>
          {c.description && <p className="mt-3 text-muted-foreground">{c.description}</p>}
          <p className="mt-6 text-lg">{t("verify.awarded", "Awarded to")} <span className="font-bold">{c.learner_name}</span></p>
          <p className="mt-1 text-sm text-muted-foreground">{date} · {c.serial}</p>
        </div>
        {c.outcomes && c.outcomes.length > 0 && (
          <div className="border-t border-border p-6 md:px-10">
            <p className="font-semibold">{t("verify.skills", "Skills shown")}</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {c.outcomes.map((o) => <li key={o} className="flex items-start gap-2 text-sm"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />{o}</li>)}
            </ul>
          </div>
        )}
      </div>
      <div className="mt-8 rounded-2xl border border-primary/20 bg-primary-soft/40 p-6 text-center">
        <p className="font-display text-xl font-bold text-primary">{t("verify.cta", "Learn the same skills, free")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("verify.ctaSub", "Short lessons in plain language that work on any phone.")}</p>
        <Button asChild variant="accent" className="mt-4">
          {c.course_slug
            ? <Link to="/courses/$slug" params={{ slug: c.course_slug }}>{t("verify.start", "Start this course")}<ArrowRight /></Link>
            : <Link to="/courses">{t("verify.browse", "Browse free courses")}<ArrowRight /></Link>}
        </Button>
      </div>
    </>
  );
}
