import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site";
import { Blocks, PageHero } from "@/components/blocks";
import { usePage } from "@/lib/content";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/for-trainers")({
  head: () => seo({
    path: "/for-trainers",
    title: "For Trainers: run community digital skills sessions | Civic Wise",
    description: "Lead practical digital skills sessions with simple tools and ready-to-use teaching materials. Create learner groups, plan workshops and track progress. Free for community facilitators in Zambia.",
  }),
  component: ForTrainers,
});

// Hero text, photo and the sections below are edited in Admin, Site pages,
// For Trainers. The sign-up buttons stay fixed because they depend on sign-in.
function ForTrainers() {
  const { t } = useI18n();
  const { user } = useAuth();
  const page = usePage("trainers");
  const p = page.data;

  return (
    <SiteLayout>
      <PageHero
        eyebrow={p?.hero_eyebrow === "For Trainers" ? t("nav.trainers", "For Trainers") : p?.hero_eyebrow}
        title={p?.hero_title || t("trainer.hero.title", "Help your community grow.")}
        intro={p?.hero_subline || t("trainer.hero.sub", "Lead practical digital skills sessions with simple tools and ready-to-use teaching materials.")}
        image={p?.hero_image_url}
        imageAlt={t("trainer.photo.alt", "A community facilitator helping adult learners use their phones")}
      >
        {user ? (
          <div className="mt-8">
            <Button asChild variant="accent" size="lg"><Link to="/trainer">{t("trainer.cta.open", "Open trainer tools")}<ArrowRight /></Link></Button>
          </div>
        ) : (
          <>
            <div className="mt-8">
              <Button asChild variant="accent" size="lg"><Link to="/signup">{t("trainer.cta.create", "Create free account")}</Link></Button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {t("trainer.cta.already", "Already registered?")}{" "}
              <Link to="/signin" className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80">{t("nav.signin", "Sign in")}</Link>
            </p>
          </>
        )}
      </PageHero>
      <Blocks blocks={p?.blocks ?? []} />
      <div className="pb-8" />
    </SiteLayout>
  );
}
