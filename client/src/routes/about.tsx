import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteLayout, ErrorNote, Motif } from "@/components/site";
import { useI18n } from "@/lib/i18n";
import { usePage, useSetting } from "@/lib/content";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => seo({
    path: "/about",
    title: "About Civic Wise: built with communities, for communities",
    description: "Civic Wise helps people across Zambia use phones and the internet with confidence. A free, offline-friendly platform by the Zambia Cyber Security Foundation, built with and for local communities.",
  }),
  component: About,
});

// The About photo comes from the CMS (Cloudinary URL in site settings, set under
// admin Branding). Falls back to the on-brand illustration when none is set.
function AboutImage({ src, alt }: { src?: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-primary-soft/40 shadow-sm">
      {src && !failed ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <Motif kind="users" className="h-full w-full" />
      )}
    </div>
  );
}

function About() {
  const { t } = useI18n();
  const page = usePage("about");
  const photo = useSetting<string>("about_image_url");

  if (page.isLoading) {
    return (
      <SiteLayout>
        <div className="container-page space-y-4 py-16">
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      </SiteLayout>
    );
  }
  if (page.isError || !page.data) {
    return (
      <SiteLayout>
        <div className="container-page py-16"><ErrorNote /></div>
      </SiteLayout>
    );
  }

  // CMS-managed values drive the page; the mockup copy is the fallback so the
  // page stays editable in the admin without going blank.
  const b = page.data.body ?? {};
  const heading = page.data.hero_title || t("about.title", "Built with communities, for communities.");
  const intro = page.data.hero_subline || t("about.intro", "Helping people across Zambia use phones and the internet with confidence.");
  const mission = b.mission || t("about.mission", "We make digital skills simple, practical and accessible. Our lessons help people stay safe online, connect with others and find new opportunities.");
  const audience = b.audience || t("about.audience", "For young people, women, workers and first-time learners.");

  return (
    <SiteLayout>
      {/* Hero: two columns on desktop, stacked on mobile */}
      <section className="container-page grid items-center gap-10 py-12 md:grid-cols-2 md:gap-14 md:py-16">
        <div>
          <p className="eyebrow">{t("about.eyebrow", "About us")}</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] text-primary md:text-5xl">{heading}</h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">{intro}</p>
        </div>
        <AboutImage src={photo.data} alt={t("about.photo.alt", "Community members learning together on a phone")} />
      </section>

      {/* Mission: compact two-column on desktop, stacked on mobile */}
      <section className="container-page grid gap-4 py-6 md:grid-cols-[minmax(0,15rem)_1fr] md:gap-12 md:py-10">
        <h2 className="text-2xl text-primary md:text-3xl">{t("about.mission.title", "Our mission")}</h2>
        <p className="max-w-2xl text-lg leading-relaxed text-foreground/80">{mission}</p>
      </section>

      {/* Thin divider + one quiet audience sentence */}
      <section className="container-page pb-16 pt-4">
        <hr className="border-border" />
        <p className="mt-6 text-muted-foreground">{audience}</p>
      </section>
    </SiteLayout>
  );
}
