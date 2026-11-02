import { createFileRoute } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteLayout, ErrorNote } from "@/components/site";
import { Blocks, PageHero } from "@/components/blocks";
import { useI18n } from "@/lib/i18n";
import { usePage } from "@/lib/content";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => seo({
    path: "/about",
    title: "About Civic Wise: built with communities, for communities",
    description: "Civic Wise helps people across Zambia use phones and the internet with confidence. A free, offline-friendly platform by the Zambia Cyber Security Foundation, built with and for local communities.",
  }),
  component: About,
});

// Everything on this page is edited in Admin, Site pages, About.
function About() {
  const { t } = useI18n();
  const page = usePage("about");

  if (page.isLoading) {
    return (
      <SiteLayout>
        <div className="container-page space-y-4 py-16"><Skeleton className="h-12 w-2/3" /><Skeleton className="h-64 w-full" /></div>
      </SiteLayout>
    );
  }
  if (page.isError || !page.data) {
    return <SiteLayout><div className="container-page py-16"><ErrorNote /></div></SiteLayout>;
  }

  const p = page.data;
  return (
    <SiteLayout>
      <PageHero
        eyebrow={p.hero_eyebrow === "About us" ? t("about.eyebrow", "About us") : p.hero_eyebrow}
        title={p.hero_title || t("about.title", "Built with communities, for communities.")}
        intro={p.hero_subline || t("about.intro", "Helping people across Zambia use phones and the internet with confidence.")}
        image={p.hero_image_url}
        imageAlt={t("about.photo.alt", "Community members learning together on a phone")}
      />
      <Blocks blocks={p.blocks ?? []} />
      <div className="pb-8" />
    </SiteLayout>
  );
}
