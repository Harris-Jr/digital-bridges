import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteLayout, Icon, CourseCard, CardsSkeleton, ErrorNote, Motif } from "@/components/site";
import { usePage, usePublished, usePublishedCourses } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Digital Bridges — Learn to use your phone safely" },
      { name: "description", content: "Free, simple digital skills lessons for communities in Zambia: mobile money, online safety, finding work and more." },
      { property: "og:title", content: "Digital Bridges — Learn to use your phone safely" },
      { property: "og:description", content: "Free, simple digital skills lessons for communities in Zambia." },
    ],
  }),
  component: Home,
});

function Home() {
  const { t } = useI18n();
  const page = usePage("home");
  const stats = usePublished<{ id: string; label: string; value: string }>("stats");
  const courses = usePublishedCourses();
  const testimonials = usePublished<{ id: string; quote: string; name: string; role_location: string }>("testimonials");
  const partners = usePublished<{ id: string; name: string; category: string }>("partners");
  const body = page.data?.body ?? {};

  return (
    <SiteLayout>
      <section className="container-page grid items-center gap-10 py-12 md:grid-cols-2 md:py-20">
        <div>
          {page.isLoading ? (
            <div className="space-y-4"><Skeleton className="h-14 w-full" /><Skeleton className="h-14 w-4/5" /><Skeleton className="h-20 w-full" /></div>
          ) : page.data ? (
            <>
              <h1 className="text-4xl md:text-6xl">{page.data.hero_title}</h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">{page.data.hero_subline}</p>
            </>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="accent" size="lg"><Link to="/signup">{t("nav.start", "Start learning")}<ArrowRight /></Link></Button>
            <Button asChild variant="outline" size="lg"><Link to="/courses">See all courses</Link></Button>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
          <div className="grid grid-cols-2">
            <Motif kind="phone" className="aspect-square w-full" />
            <Motif kind="radio" className="aspect-square w-full" />
            <Motif kind="community" className="aspect-square w-full" />
            <Motif kind="shield" className="aspect-square w-full" />
          </div>
        </div>
      </section>

      {stats.data && stats.data.length > 0 && (
        <section aria-label="Platform at a glance" className="border-y border-border bg-primary text-primary-foreground">
          <dl className="container-page grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
            {stats.data.map((s) => (
              <div key={s.id}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-3xl font-extrabold text-accent">{s.value}</dd>
                <dd className="text-sm opacity-90">{s.label}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {Array.isArray(body.why) && body.why.length > 0 && (
        <section className="container-page py-16">
          <p className="eyebrow">Why this platform</p>
          <h2 className="mt-2 text-3xl">Made for the way people here use phones</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {body.why.map((w: { title: string; body: string; icon?: string }) => (
              <div key={w.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <Icon name={w.icon} className="size-7 text-primary" />
                <h3 className="mt-4 text-lg">{w.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{w.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="container-page py-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Courses</p>
            <h2 className="mt-2 text-3xl">Start with one of these</h2>
          </div>
          <Link to="/courses" className="hidden font-semibold text-primary hover:underline sm:inline">All courses</Link>
        </div>
        <div className="mt-8">
          {courses.isLoading ? <CardsSkeleton /> : courses.isError ? <ErrorNote /> : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {courses.data?.slice(0, 4).map((c, i) => <CourseCard key={c.id} course={c} index={i} />)}
            </div>
          )}
        </div>
      </section>

      {Array.isArray(body.steps) && body.steps.length > 0 && (
        <section className="container-page py-16">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-2 text-3xl">Three steps</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {body.steps.map((s: { title: string; body: string }, i: number) => (
              <li key={s.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <span className="flex size-10 items-center justify-center rounded-full bg-accent font-display text-lg font-extrabold text-accent-foreground">{i + 1}</span>
                <h3 className="mt-4 text-lg">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {testimonials.data && testimonials.data.length > 0 && (
        <section className="container-page py-8">
          <p className="eyebrow">From learners</p>
          <h2 className="mt-2 text-3xl">What people tell us</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {testimonials.data.map((q) => (
              <figure key={q.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <Quote className="size-6 text-accent" aria-hidden="true" />
                <blockquote className="mt-3">{q.quote}</blockquote>
                <figcaption className="mt-4 text-sm"><span className="font-semibold">{q.name}</span><span className="text-muted-foreground"> · {q.role_location}</span></figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {partners.data && partners.data.length > 0 && (
        <section className="container-page py-16">
          <p className="eyebrow">Working with</p>
          <ul className="mt-4 flex flex-wrap gap-3">
            {partners.data.map((p) => (
              <li key={p.id} className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold">{p.name}</li>
            ))}
          </ul>
        </section>
      )}
    </SiteLayout>
  );
}
