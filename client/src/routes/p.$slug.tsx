import { createFileRoute, Link } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteLayout } from "@/components/site";
import { Blocks, PageHero } from "@/components/blocks";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { SitePage } from "@/lib/content";
import { seo } from "@/lib/seo";

// Pages made in Admin, Site pages, New page. Served at /p/<address>.
export const Route = createFileRoute("/p/$slug")({
  loader: async ({ params }) => {
    try { return await apiGet<SitePage | null>(`/pages/${params.slug}`, false); } catch { return null; }
  },
  head: ({ loaderData, params }) => seo({
    path: `/p/${params.slug}`,
    title: loaderData?.hero_title ? `${loaderData.hero_title} | Civic Wise` : "Civic Wise",
    description: loaderData?.hero_subline || "Free digital and civic skills for Zambia.",
    ...(loaderData?.hero_image_url ? { image: loaderData.hero_image_url } : {}),
  }),
  component: CustomPage,
});

function CustomPage() {
  const { slug } = Route.useParams();
  const initial = Route.useLoaderData();
  const page = useQuery({ queryKey: ["page", slug], queryFn: () => apiGet<SitePage | null>(`/pages/${slug}`, false), initialData: initial ?? undefined, retry: false });
  const p = page.data;

  if (page.isLoading) {
    return <SiteLayout><div className="container-page space-y-4 py-16"><Skeleton className="h-12 w-2/3" /><Skeleton className="h-64 w-full" /></div></SiteLayout>;
  }
  if (!p) {
    return (
      <SiteLayout>
        <div className="container-page py-20 text-center">
          <h1 className="text-3xl">Page not found</h1>
          <p className="mt-3 text-muted-foreground">This page does not exist or is not published yet.</p>
          <Link to="/" className="mt-6 inline-block font-semibold text-primary hover:underline">Go to the home page</Link>
        </div>
      </SiteLayout>
    );
  }
  return (
    <SiteLayout>
      {(p.hero_title || p.hero_image_url) && (
        <PageHero eyebrow={p.hero_eyebrow} title={p.hero_title} intro={p.hero_subline} image={p.hero_image_url} />
      )}
      <Blocks blocks={p.blocks ?? []} />
      <div className="pb-8" />
    </SiteLayout>
  );
}
