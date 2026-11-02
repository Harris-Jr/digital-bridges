import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AdaptiveLayout } from "@/components/app-shell";
import { EmptyState, RichText } from "@/components/site";
import { apiGet } from "@/lib/api";
import { formatDate, usePosts, type PostFull } from "@/lib/content";
import { canonical, JsonLd, seo } from "@/lib/seo";

export const Route = createFileRoute("/news/$slug")({
  // Fetch the post before rendering so the page title, description and social
  // preview use the real story.
  loader: async ({ params }) => {
    try { return await apiGet<PostFull>(`/posts/${params.slug}`, false); } catch { return null; }
  },
  head: ({ loaderData, params }) => seo({
    path: `/news/${params.slug}`,
    title: loaderData ? `${loaderData.title} | Civic Wise` : "News | Civic Wise",
    description: loaderData?.excerpt || "A story from Civic Wise.",
    type: "article",
    ...(loaderData?.cover_url ? { image: loaderData.cover_url } : {}),
  }),
  component: Article,
});

function Article() {
  const { slug } = Route.useParams();
  const initial = Route.useLoaderData();
  const q = useQuery({ queryKey: ["post", slug], queryFn: () => apiGet<PostFull>(`/posts/${slug}`, false), initialData: initial ?? undefined, retry: false });
  const more = usePosts({ limit: 4 });
  const [copied, setCopied] = useState(false);

  if (q.isLoading) return <AdaptiveLayout><div className="container-page max-w-3xl space-y-4 py-16"><Skeleton className="h-10 w-2/3" /><Skeleton className="h-64 w-full rounded-2xl" /></div></AdaptiveLayout>;
  const p = q.data;
  if (!p) return <AdaptiveLayout><div className="container-page py-16"><EmptyState icon="Newspaper" title="Story not found" body="It may have been moved or unpublished." action={<Button asChild><Link to="/news">All news</Link></Button>} /></div></AdaptiveLayout>;

  const url = canonical(`/news/${p.slug}`);
  const enc = encodeURIComponent;
  const ld = {
    "@context": "https://schema.org", "@type": "NewsArticle", headline: p.title, description: p.excerpt,
    datePublished: p.published_at, dateModified: p.updated_at, ...(p.cover_url ? { image: [p.cover_url] } : {}),
    author: p.author_name ? { "@type": "Person", name: p.author_name } : { "@type": "Organization", name: "Civic Wise" },
    publisher: { "@type": "Organization", name: "Civic Wise", url: canonical("/") }, mainEntityOfPage: url,
  };

  return (
    <AdaptiveLayout>
      <JsonLd data={[ld]} />
      <article className="container-page max-w-3xl py-10 md:py-14">
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4"><Link to="/news"><ArrowLeft className="size-4" />All news</Link></Button>
        <p className="flex flex-wrap gap-x-2 text-sm font-semibold text-primary">
          {p.tags.map((t) => <Link key={t} to="/news" search={{ tag: t }} className="hover:underline">{t}</Link>)}
        </p>
        <h1 className="mt-2 text-3xl md:text-5xl">{p.title}</h1>
        {p.excerpt && <p className="mt-4 text-lg text-muted-foreground">{p.excerpt}</p>}
        <p className="mt-4 text-sm text-muted-foreground">{p.author_name ? `${p.author_name} · ` : ""}{formatDate(p.published_at)}</p>
        {p.cover_url && <img src={p.cover_url} alt={p.cover_alt} className="mt-8 w-full rounded-2xl border border-border object-cover" />}
        <div className="mt-8"><RichText text={p.body} /></div>

        <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-border pt-6">
          <span className="mr-2 text-sm font-semibold">Share:</span>
          <a className="inline-flex min-h-10 items-center rounded-full bg-[#25D366] px-4 text-sm font-semibold text-white" href={`https://wa.me/?text=${enc(`${p.title} ${url}`)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <a className="inline-flex min-h-10 items-center rounded-full bg-[#1877F2] px-4 text-sm font-semibold text-white" href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`} target="_blank" rel="noopener noreferrer">Facebook</a>
          <Button variant="outline" size="sm" onClick={async () => { try { await navigator.clipboard.writeText(url); setCopied(true); } catch { /* blocked */ } }}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}{copied ? "Copied" : "Copy link"}
          </Button>
        </div>
      </article>

      {(more.data?.posts.filter((x) => x.slug !== p.slug).length ?? 0) > 0 && (
        <section className="container-page max-w-5xl pb-16">
          <h2 className="text-2xl">More news</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            {more.data!.posts.filter((x) => x.slug !== p.slug).slice(0, 3).map((x) => (
              <Link key={x.id} to="/news/$slug" params={{ slug: x.slug }} className="overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary">
                {x.cover_url ? <img src={x.cover_url} alt={x.cover_alt} loading="lazy" className="aspect-[16/10] w-full object-cover" /> : <div className="aspect-[16/10] bg-primary-soft" />}
                <div className="p-4"><p className="text-xs text-muted-foreground">{formatDate(x.published_at)}</p><p className="mt-1 font-semibold leading-snug">{x.title}</p></div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </AdaptiveLayout>
  );
}
