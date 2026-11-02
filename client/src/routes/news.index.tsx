import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdaptiveLayout } from "@/components/app-shell";
import { CardsSkeleton, EmptyState, ErrorNote, PageHero } from "@/components/site";
import { formatDate, usePosts, usePostTags, type PostSummary } from "@/lib/content";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/news/")({
  validateSearch: (s: Record<string, unknown>): { tag?: string; page?: number } => ({
    tag: typeof s.tag === "string" && s.tag ? s.tag : undefined,
    page: typeof s.page === "number" && s.page > 1 ? s.page : undefined,
  }),
  head: () => seo({
    path: "/news",
    title: "News | Civic Wise",
    description: "Stories, workshops and updates from Civic Wise and communities learning digital and civic skills across Zambia.",
  }),
  component: NewsPage,
});

function NewsPage() {
  const { tag, page = 1 } = Route.useSearch();
  const posts = usePosts({ tag, page });
  const tags = usePostTags();
  const list = posts.data?.posts ?? [];
  const [lead, ...rest] = page === 1 && !tag ? list : [undefined, ...list];
  const pages = posts.data ? Math.ceil(posts.data.total / posts.data.limit) : 1;

  return (
    <AdaptiveLayout>
      <PageHero eyebrow="News" title="Stories and updates" sub="Workshops, partners and people learning digital and civic skills across Zambia." />
      <section className="container-page pb-16">
        {(tags.data?.length ?? 0) > 0 && (
          <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter by topic">
            <Link to="/news" search={{}} className={cn("min-h-10 rounded-full border px-4 py-2 text-sm font-semibold", !tag ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary")}>All</Link>
            {tags.data!.map((t) => (
              <Link key={t.tag} to="/news" search={{ tag: t.tag }} className={cn("min-h-10 rounded-full border px-4 py-2 text-sm font-semibold", tag === t.tag ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary")}>{t.tag}</Link>
            ))}
          </div>
        )}

        {posts.isLoading ? <CardsSkeleton n={6} /> : posts.isError ? <ErrorNote /> : list.length === 0 ? (
          <EmptyState icon="Newspaper" title="No news yet" body="Stories and updates will appear here soon." action={tag ? <Button asChild variant="outline"><Link to="/news" search={{}}>Show all news</Link></Button> : undefined} />
        ) : (
          <>
            {lead && (
              <Link to="/news/$slug" params={{ slug: lead.slug }} className="group mb-10 grid overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-colors hover:border-primary md:grid-cols-2">
                <Cover post={lead} className="aspect-[16/10] md:aspect-auto md:h-full" />
                <div className="flex flex-col justify-center p-6 md:p-8">
                  <Meta post={lead} />
                  <h2 className="mt-2 text-2xl md:text-3xl">{lead.title}</h2>
                  {lead.excerpt && <p className="mt-3 text-muted-foreground">{lead.excerpt}</p>}
                  <span className="mt-4 inline-flex items-center gap-1 font-semibold text-primary">Read the story<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></span>
                </div>
              </Link>
            )}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.filter(Boolean).map((p) => (
                <Link key={p!.id} to="/news/$slug" params={{ slug: p!.slug }} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-colors hover:border-primary">
                  <Cover post={p!} className="aspect-[16/10]" />
                  <div className="flex flex-1 flex-col p-5">
                    <Meta post={p!} />
                    <h3 className="mt-2 text-lg leading-snug">{p!.title}</h3>
                    {p!.excerpt && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p!.excerpt}</p>}
                  </div>
                </Link>
              ))}
            </div>
            {pages > 1 && (
              <nav aria-label="Pages" className="mt-10 flex items-center justify-center gap-3">
                <Button asChild variant="outline" disabled={page <= 1}><Link to="/news" search={{ tag, page: page - 1 > 1 ? page - 1 : undefined }}>Newer</Link></Button>
                <span className="text-sm text-muted-foreground">Page {page} of {pages}</span>
                <Button asChild variant="outline" disabled={page >= pages}><Link to="/news" search={{ tag, page: page + 1 }}>Older</Link></Button>
              </nav>
            )}
          </>
        )}
      </section>
    </AdaptiveLayout>
  );
}

function Cover({ post, className }: { post: PostSummary; className?: string }) {
  return post.cover_url
    ? <img src={post.cover_url} alt={post.cover_alt} loading="lazy" className={cn("w-full object-cover", className)} />
    : <div className={cn("grid w-full place-items-center bg-primary-soft", className)}><Newspaper className="size-10 text-primary" aria-hidden="true" /></div>;
}

function Meta({ post }: { post: PostSummary }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 text-xs font-semibold uppercase tracking-wide text-primary">
      {post.tags[0] && <span>{post.tags[0]}</span>}
      {post.tags[0] && <span aria-hidden="true">·</span>}
      <span className="text-muted-foreground">{formatDate(post.published_at)}</span>
    </p>
  );
}
