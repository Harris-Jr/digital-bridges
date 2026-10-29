import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Printer, Loader2, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiGet, getToken } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/certificates/$slug")({
  beforeLoad: () => {
    if (!getToken()) throw redirect({ to: "/signin" });
  },
  component: CertificatePage,
});

type Cert = { learner_name: string; course_title: string; issued_at: string; serial: string };

function CertificatePage() {
  const { slug } = Route.useParams();
  const { t } = useI18n();
  const q = useQuery({ queryKey: ["certificate", slug], queryFn: () => apiGet<Cert>(`/me/certificates/${slug}`) });

  if (q.isLoading) return <div className="grid min-h-screen place-items-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  if (q.isError || !q.data)
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <div>
          <p className="text-lg font-semibold">{t("cert.notfound", "Certificate not found")}</p>
          <p className="mt-1 text-muted-foreground">{t("cert.notfoundBody", "Finish all the lessons in a course to earn its certificate.")}</p>
          <Button asChild className="mt-6"><Link to="/dashboard"><ArrowLeft />{t("cert.back", "Back to my learning")}</Link></Button>
        </div>
      </div>
    );

  const c = q.data;
  const date = new Date(c.issued_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-muted/40 px-4 py-8 print:bg-white print:p-0">
      <div className="mx-auto mb-5 flex max-w-3xl items-center justify-between print:hidden">
        <Button asChild variant="ghost" size="sm"><Link to="/dashboard"><ArrowLeft />{t("cert.back", "Back to my learning")}</Link></Button>
        <Button size="sm" onClick={() => window.print()}><Printer className="size-4" />{t("cert.print", "Print / Save as PDF")}</Button>
      </div>

      <div className="mx-auto max-w-3xl rounded-2xl bg-card p-2 shadow-lg print:max-w-none print:rounded-none print:shadow-none">
        <div className="rounded-xl border-[3px] border-primary/70 p-8 text-center sm:p-14">
          <div className="flex items-center justify-center gap-2.5">
            <img src="/images/brand-icon.png" alt="" className="h-9 w-auto" />
            <span className="font-display text-2xl font-extrabold tracking-tight">
              <span className="text-primary">Civic</span> <span className="text-accent">Wise</span>
            </span>
          </div>
          <p className="mt-10 font-display text-sm font-bold uppercase tracking-[0.2em] text-primary">{t("cert.title", "Certificate of Completion")}</p>
          <p className="mt-8 text-muted-foreground">{t("cert.certifies", "This certifies that")}</p>
          <p className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">{c.learner_name}</p>
          <p className="mt-6 text-muted-foreground">{t("cert.completed", "has completed the course")}</p>
          <p className="mt-2 text-2xl font-semibold text-primary">{c.course_title}</p>

          <Award className="mx-auto mt-10 size-10 text-accent" aria-hidden="true" />

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
            <span>{t("cert.issued", "Issued")} {date}</span>
            <span>Civic Wise · Zambia</span>
            <span>No. {c.serial}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
