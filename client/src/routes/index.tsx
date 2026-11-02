import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteLayout, Motif } from "@/components/site";
import { Blocks } from "@/components/blocks";
import { usePage } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => seo({
    path: "/",
    title: "Civic Wise: Free digital and civic skills for Zambia",
    description: "Build confidence online and in your community. Free, simple lessons on using your phone safely, mobile money, finding work, your rights and taking part in your community. Works on any phone, even with little data.",
  }),
  component: Home,
});

// The hero text and photo, and every section below it, are edited in
// Admin, Site pages, Home.
function Home() {
  const { t } = useI18n();
  const page = usePage("home");
  const p = page.data;

  return (
    <SiteLayout>
      <div className="border-b border-border bg-gradient-to-b from-primary-soft/40 via-primary-soft/10 to-background">
        <section className="container-page grid items-center gap-10 py-12 md:grid-cols-2 md:py-20">
          <div>
            {page.isLoading ? (
              <div className="space-y-4"><Skeleton className="h-14 w-full" /><Skeleton className="h-14 w-4/5" /><Skeleton className="h-20 w-full" /></div>
            ) : (
              <>
                {p?.hero_eyebrow && <p className="eyebrow mb-3">{p.hero_eyebrow}</p>}
                <h1 className="whitespace-pre-line text-4xl leading-[1.05] md:text-6xl">
                  {p?.hero_title || t("home.hero.title", "Learn more.\nDo more.\nTake part.")}
                </h1>
                <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                  {p?.hero_subline || t("home.hero.sub", "Build confidence online and in your community. Learn practical digital skills, understand public services, and discover how to make your voice heard.")}
                </p>
              </>
            )}
            <div className="mt-8">
              <Button asChild variant="accent" size="lg"><Link to="/signup">{t("home.hero.cta", "Start Learning")}<ArrowRight /></Link></Button>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
            {p?.hero_image_url ? (
              <img src={p.hero_image_url} alt="" className="aspect-square w-full object-cover md:aspect-[4/3]" />
            ) : (
              <div className="grid grid-cols-2">
                <Motif kind="phone" className="aspect-square w-full" />
                <Motif kind="radio" className="aspect-square w-full" />
                <Motif kind="community" className="aspect-square w-full" />
                <Motif kind="shield" className="aspect-square w-full" />
              </div>
            )}
          </div>
        </section>
      </div>

      <Blocks blocks={p?.blocks ?? []} />
    </SiteLayout>
  );
}
