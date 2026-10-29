import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Users, FileText, CalendarCheck, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout, Motif } from "@/components/site";
import { usePage } from "@/lib/content";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/for-trainers")({
  head: () => ({
    meta: [
      { title: "For Trainers — Civic Wise" },
      { name: "description", content: "Lead practical digital skills sessions with simple tools and ready-to-use teaching materials." },
      { property: "og:title", content: "For Trainers — Civic Wise" },
      { property: "og:description", content: "Help your community grow with free facilitator tools." },
    ],
  }),
  component: ForTrainers,
});

// Drop a real facilitator photo at client/public/images/for-trainers-image.png.
// Until then this falls back to the on-brand illustration below.
const TRAINER_IMAGE = "/images/for-trainers-image.png";

function TrainerImage({ alt }: { alt: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-primary-soft/40 shadow-sm">
      {failed ? (
        <Motif kind="users" className="h-full w-full" />
      ) : (
        <img
          src={TRAINER_IMAGE}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}

function ForTrainers() {
  const { t } = useI18n();
  const { user } = useAuth();
  const page = usePage("trainers");

  const heading = page.data?.hero_title || t("trainer.hero.title", "Help your community grow.");
  const intro = page.data?.hero_subline || t("trainer.hero.sub", "Lead practical digital skills sessions with simple tools and ready-to-use teaching materials.");

  const features = [
    { icon: Users, title: t("trainer.feat.groups", "Learner groups"), body: t("trainer.feat.groupsBody", "Create a group and follow learner progress.") },
    { icon: FileText, title: t("trainer.feat.materials", "Teaching materials"), body: t("trainer.feat.materialsBody", "Download guides and posters for your sessions.") },
    { icon: CalendarCheck, title: t("trainer.feat.workshops", "Workshop planning"), body: t("trainer.feat.workshopsBody", "Submit workshop requests for team approval.") },
    { icon: BarChart3, title: t("trainer.feat.progress", "Progress overview"), body: t("trainer.feat.progressBody", "See how your community groups are learning.") },
  ];

  return (
    <SiteLayout>
      {/* Hero: two columns on desktop, stacked on mobile */}
      <section className="container-page grid items-center gap-10 py-12 md:grid-cols-2 md:gap-14 md:py-16">
        <div>
          <p className="eyebrow">{t("nav.trainers", "For Trainers")}</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] text-primary md:text-5xl">{heading}</h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">{intro}</p>

          {/* Tools live behind sign-in. Signed-in users go straight through. */}
          {user ? (
            <div className="mt-8">
              <Button asChild variant="accent" size="lg">
                <Link to="/trainer">{t("trainer.cta.open", "Open trainer tools")}<ArrowRight /></Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="mt-8">
                <Button asChild variant="accent" size="lg">
                  <Link to="/signup">{t("trainer.cta.create", "Create free account")}</Link>
                </Button>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {t("trainer.cta.already", "Already registered?")}{" "}
                <Link to="/signin" className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80">{t("nav.signin", "Sign in")}</Link>
              </p>
            </>
          )}
        </div>
        <TrainerImage alt={t("trainer.photo.alt", "A community facilitator helping adult learners use their phones")} />
      </section>

      {/* Features: compact, unboxed icon-and-text items */}
      <section className="container-page py-6 md:py-10">
        <h2 className="text-center text-2xl text-primary md:text-3xl">{t("trainer.feat.title", "Everything you need to lead a session")}</h2>
        <div className="mx-auto mt-8 grid max-w-4xl gap-x-10 gap-y-8 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="flex gap-4">
              <f.icon className="size-7 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Thin divider + one quiet closing line */}
      <section className="container-page pb-16 pt-4">
        <hr className="border-border" />
        <p className="mt-6 text-center text-muted-foreground">{t("trainer.closing", "Free tools. Practical lessons. Stronger communities.")}</p>
      </section>
    </SiteLayout>
  );
}
