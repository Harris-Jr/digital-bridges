import { createFileRoute } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteLayout, PageHero, Icon, ErrorNote } from "@/components/site";
import { usePage, usePublished } from "@/lib/content";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Digital Bridges" },
      { name: "description", content: "Why we built Digital Bridges, who we serve across Zambia, and how lessons are tested with communities." },
      { property: "og:title", content: "About — Digital Bridges" },
      { property: "og:description", content: "Built with communities in Lusaka, Kitwe, Kazungula and Chipata." },
    ],
  }),
  component: About,
});

function About() {
  const page = usePage("about");
  const partners = usePublished<{ id: string; name: string }>("partners");
  if (page.isLoading) return <SiteLayout><div className="container-page space-y-4 py-16"><Skeleton className="h-12 w-2/3" /><Skeleton className="h-40 w-full" /></div></SiteLayout>;
  if (page.isError || !page.data) return <SiteLayout><div className="container-page py-16"><ErrorNote /></div></SiteLayout>;
  const b = page.data.body ?? {};
  return (
    <SiteLayout>
      <PageHero eyebrow="About us" title={page.data.hero_title} sub={page.data.hero_subline} />
      {b.mission && (
        <section className="container-page max-w-3xl py-6">
          <h2 className="text-2xl">Our mission</h2>
          <p className="mt-3 text-lg">{b.mission}</p>
        </section>
      )}
      {Array.isArray(b.groups) && b.groups.length > 0 && (
        <section className="container-page py-12">
          <h2 className="text-2xl">Who we serve</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {b.groups.map((g: { title: string; body: string; icon?: string }) => (
              <div key={g.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <Icon name={g.icon} className="size-7 text-primary" />
                <h3 className="mt-3 text-lg">{g.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{g.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      {Array.isArray(b.approach) && b.approach.length > 0 && (
        <section className="container-page py-12">
          <h2 className="text-2xl">How we build lessons</h2>
          <ol className="mt-6 space-y-0 border-l-2 border-primary pl-6">
            {b.approach.map((s: { title: string; body: string }, i: number) => (
              <li key={s.title} className="relative pb-8">
                <span className="absolute -left-[2.05rem] flex size-8 items-center justify-center rounded-full bg-accent font-display font-extrabold">{i + 1}</span>
                <h3 className="text-lg">{s.title}</h3>
                <p className="text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
      {partners.data && partners.data.length > 0 && (
        <section className="container-page py-8">
          <h2 className="text-2xl">Our partners</h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {partners.data.map((p) => <li key={p.id} className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold">{p.name}</li>)}
          </ul>
        </section>
      )}
    </SiteLayout>
  );
}
