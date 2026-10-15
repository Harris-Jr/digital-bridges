import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteLayout, Icon, CourseCard, CardsSkeleton, ErrorNote, Motif } from "@/components/site";
import { Testimonials, Partners } from "@/components/home-sections";
import { usePage, usePublished, usePublishedCourses } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

const WHY_TONE = [
  "bg-primary-soft text-primary group-hover:bg-primary group-hover:text-primary-foreground",
  "bg-accent-soft text-accent-foreground group-hover:bg-accent group-hover:text-accent-foreground",
  "bg-primary-soft text-primary group-hover:bg-primary group-hover:text-primary-foreground",
  "bg-accent-soft text-accent-foreground group-hover:bg-accent group-hover:text-accent-foreground",
];

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
        <section className="container-page py-16 md:py-20">
          <div className="max-w-2xl">
            <p className="eyebrow">Why this platform</p>
            <h2 className="mt-2 text-3xl md:text-4xl">Made for the way people here use phones</h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Short, plain-language lessons that work on any handset — built with communities, not for a classroom far away.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {body.why.map((w: { title: string; body: string; icon?: string }, i: number) => (
              <div
                key={w.title}
                className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-[transform,box-shadow,border-color] duration-300 ease-out hover:border-primary/40 hover:shadow-md motion-safe:hover:-translate-y-1"
              >
                <span className={`grid size-14 place-items-center rounded-2xl transition-colors duration-300 ${WHY_TONE[i % WHY_TONE.length]}`}>
                  <Icon name={w.icon} className="size-7" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{w.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{w.body}</p>
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
        <section className="border-y border-border bg-secondary/40">
          <div className="container-page py-16 md:py-20">
            <div className="max-w-2xl">
              <p className="eyebrow">How it works</p>
              <h2 className="mt-2 text-3xl md:text-4xl">Three steps to get going</h2>
            </div>
            <ol className="relative mt-12 grid gap-10 md:grid-cols-3 md:gap-6">
              {/* connecting line behind the numbers on desktop */}
              <span aria-hidden="true" className="absolute left-0 right-0 top-7 hidden h-px bg-border md:block" />
              {body.steps.map((s: { title: string; body: string }, i: number) => (
                <li key={s.title} className="relative">
                  <span className="relative z-10 flex size-14 items-center justify-center rounded-full bg-primary font-display text-xl font-extrabold text-primary-foreground shadow-sm ring-8 ring-[var(--background)]">
                    {i + 1}
                  </span>
                  <h3 className="mt-5 text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <Testimonials items={testimonials.data ?? []} />

      <Partners items={partners.data ?? []} />

      {/* Closing call to action */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-accent/20 blur-2xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 size-72 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div className="container-page relative py-16 text-center md:py-20">
          <h2 className="font-display text-3xl font-extrabold md:text-4xl">Start learning today — it's free</h2>
          <p className="mx-auto mt-3 max-w-xl text-lg opacity-90">
            Make a free account in a minute and pick up on any phone. No fees, ever, for learners and community groups.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="accent" size="lg"><Link to="/signup">{t("nav.start", "Start learning")}<ArrowRight /></Link></Button>
            <Button asChild size="lg" className="border border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/trainer">Run a workshop</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
