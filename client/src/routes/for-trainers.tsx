import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, FileText, CalendarCheck, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout, PageHero } from "@/components/site";
import { usePage } from "@/lib/content";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/for-trainers")({
  head: () => ({
    meta: [
      { title: "For Trainers — Digital Bridges" },
      { name: "description", content: "Become a community facilitator: run workshops, track learner cohorts, and download teaching materials." },
      { property: "og:title", content: "For Trainers — Digital Bridges" },
      { property: "og:description", content: "Run digital skills workshops in your community." },
    ],
  }),
  component: ForTrainers,
});

function ForTrainers() {
  const { t } = useI18n();
  const { user } = useAuth();
  const page = usePage("trainers");

  const perks = [
    { icon: Users, title: t("trainer.perk.cohorts", "Run learner cohorts"), body: t("trainer.perk.cohortsBody", "Create a group, share a join code, and follow each learner's progress.") },
    { icon: FileText, title: t("trainer.perk.materials", "Teaching materials"), body: t("trainer.perk.materialsBody", "Download facilitator guides and posters made for community sessions.") },
    { icon: CalendarCheck, title: t("trainer.perk.workshops", "Plan workshops"), body: t("trainer.perk.workshopsBody", "Request a workshop and get it approved by the team.") },
    { icon: BarChart3, title: t("trainer.perk.groups", "See community groups"), body: t("trainer.perk.groupsBody", "View the groups you work with and their average completion.") },
  ];

  return (
    <SiteLayout>
      <PageHero
        eyebrow={t("nav.trainers", "For Trainers")}
        title={page.data?.hero_title ?? t("trainer.hero.title", "Run workshops in your community")}
        sub={page.data?.hero_subline ?? t("trainer.hero.sub", "Become a community facilitator and help people near you learn to use their phones safely. It is free.")}
      />

      <section className="container-page py-12 md:py-16">
        <div className="grid gap-5 sm:grid-cols-2">
          {perks.map((p) => (
            <div key={p.title} className="flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-[transform,box-shadow] duration-300 motion-safe:hover:-translate-y-1 hover:shadow-md">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary"><p.icon className="size-6" aria-hidden="true" /></span>
              <div>
                <h3 className="text-lg font-semibold">{p.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tools live behind sign-in. Signed-in users go straight through. */}
        <div className="mt-10 rounded-2xl border border-primary/20 bg-primary-soft/40 p-6 text-center md:p-8">
          {user ? (
            <>
              <h2 className="font-display text-xl font-bold text-primary md:text-2xl">{t("trainer.cta.inTitle", "Your trainer tools are ready")}</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{t("trainer.cta.inSub", "Open the trainer area to manage cohorts, plan a workshop, and download materials.")}</p>
              <div className="mt-5"><Button asChild size="lg"><Link to="/trainer">{t("trainer.cta.open", "Open trainer tools")}<ArrowRight /></Link></Button></div>
            </>
          ) : (
            <>
              <h2 className="font-display text-xl font-bold text-primary md:text-2xl">{t("trainer.cta.outTitle", "Sign in to start facilitating")}</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{t("trainer.cta.outSub", "Trainer tools need a free account. Sign in or create one, then set yourself up as a facilitator in one tap.")}</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Button asChild variant="accent" size="lg"><Link to="/signup">{t("nav.start", "Create free account")}<ArrowRight /></Link></Button>
                <Button asChild variant="outline" size="lg"><Link to="/signin">{t("nav.signin", "Sign in")}</Link></Button>
              </div>
            </>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
