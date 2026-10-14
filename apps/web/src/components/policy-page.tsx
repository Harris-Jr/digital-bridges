import { Skeleton } from "@/components/ui/skeleton";
import { SiteLayout, PageHero, ErrorNote, EmptyState } from "@/components/site";
import { usePage } from "@/lib/content";

export function PolicyPage({ slug }: { slug: string }) {
  const page = usePage(slug);
  return (
    <SiteLayout>
      {page.isLoading ? (
        <div className="container-page space-y-4 py-16"><Skeleton className="h-12 w-1/2" /><Skeleton className="h-64 w-full rounded-2xl" /></div>
      ) : page.isError ? (
        <div className="container-page py-16"><ErrorNote /></div>
      ) : !page.data ? (
        <div className="container-page py-16"><EmptyState icon="FileX" title="This page is being updated" body="Please check back soon, or contact us with any questions." /></div>
      ) : (
        <>
          <PageHero title={page.data.hero_title} sub={page.data.hero_subline} />
          <article className="container-page max-w-3xl">
            <p className="text-sm text-muted-foreground">Last updated {new Date(page.data.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
            {(page.data.body?.sections ?? []).map((s: { heading: string; body: string }) => (
              <section key={s.heading} className="mt-8">
                <h2 className="text-xl">{s.heading}</h2>
                <p className="mt-2 text-foreground/90">{s.body}</p>
              </section>
            ))}
          </article>
        </>
      )}
    </SiteLayout>
  );
}
