import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, GraduationCap, Globe, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteLayout, Icon, CourseCard, CardsSkeleton, ErrorNote, Motif, FeatureStrip, useReveal } from "@/components/site";
import { Testimonials, Partners, PathwaySelector, FaqSection } from "@/components/home-sections";
import { usePage, usePublished, usePublishedCourses, usePathways } from "@/lib/content";
import { useI18n, LANGS } from "@/lib/i18n";
import { seo } from "@/lib/seo";

// Interleave courses from the two pathways (digital + civic) so the home
// shortlist always shows a mix, not just the first-loaded pathway.
function mixPathways<T extends { pathway?: { slug: string } | null }>(all: T[], n: number): T[] {
  const civic = all.filter((c) => c.pathway?.slug === "civic-education");
  const digital = all.filter((c) => c.pathway?.slug !== "civic-education");
  const out: T[] = [];
  for (let i = 0; out.length < n && (i < digital.length || i < civic.length); i++) {
    if (digital[i]) out.push(digital[i]!);
    if (out.length < n && civic[i]) out.push(civic[i]!);
  }
  return out.slice(0, n);
}

const WHY_TONE = [
  "bg-primary-soft text-primary group-hover:bg-primary group-hover:text-primary-foreground",
  "bg-accent-soft text-accent-foreground group-hover:bg-accent group-hover:text-accent-foreground",
  "bg-primary-soft text-primary group-hover:bg-primary group-hover:text-primary-foreground",
  "bg-accent-soft text-accent-foreground group-hover:bg-accent group-hover:text-accent-foreground",
];

export const Route = createFileRoute("/")({
  head: () => seo({
    path: "/",
    title: "Civic Wise: Free digital and civic skills for Zambia",
    description: "Build confidence online and in your community. Free, simple lessons on using your phone safely, mobile money, finding work, your rights and taking part in your community. Works on any phone, even with little data.",
  }),
  component: Home,
});

/* How it works: the step numbers appear and disappear as the section scrolls,
   cascading 1-2-3 on the way down and 3-2-1 on the way up. */
function HowItWorks({ eyebrow, title, steps }: { eyebrow: string; title: string; steps: { title: string; body: string }[] }) {
  const dir = useRef<"down" | "up">("down");
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => { const y = window.scrollY; if (y !== last) { dir.current = y > last ? "down" : "up"; last = y; } };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="container-page py-16 md:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-2 text-3xl md:text-4xl">{title}</h2>
        </div>
        <ol className="relative mt-12 grid gap-10 md:grid-cols-3 md:gap-6">
          <span aria-hidden="true" className="absolute left-0 right-0 top-7 hidden h-px bg-border md:block" />
          {steps.map((s, i) => (
            <Step key={s.title} step={s} index={i} total={steps.length} dir={dir} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function Step({ step, index, total, dir }: { step: { title: string; body: string }; index: number; total: number; dir: React.RefObject<"down" | "up"> }) {
  const [vis, setVis] = useState(false);
  const [delay, setDelay] = useState(0);
  const ref = useCallback((node: HTMLLIElement | null) => {
    if (!node || typeof IntersectionObserver === "undefined") { setVis(true); return; }
    const io = new IntersectionObserver(
      ([e]) => {
        const d = dir.current ?? "down";
        setDelay((d === "down" ? index : total - 1 - index) * 140);
        setVis(!!e?.isIntersecting);
      },
      { threshold: 0.35, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [index, total, dir]);
  return (
    <li ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`db-step${vis ? " is-in" : ""} relative`}>
      <span className="relative z-10 flex size-14 items-center justify-center rounded-full bg-primary font-display text-xl font-extrabold text-primary-foreground shadow-sm ring-8 ring-[var(--background)]">
        {index + 1}
      </span>
      <h3 className="mt-5 text-xl font-semibold">{step.title}</h3>
      <p className="mt-2 leading-relaxed text-muted-foreground">{step.body}</p>
    </li>
  );
}

function Home() {
  const { t } = useI18n();
  const page = usePage("home");
  const pathways = usePathways();
  const courses = usePublishedCourses();
  const testimonials = usePublished<{ id: string; quote: string; name: string; role_location: string }>("testimonials");
  const partners = usePublished<{ id: string; name: string; category: string }>("partners");
  const faqs = usePublished<{ id: string; question: string; answer: string }>("faqs");
  const body = page.data?.body ?? {};
  const statsReveal = useReveal<HTMLDListElement>();
  const coursesReveal = useReveal<HTMLDivElement>();

  // Real figures, counted from the database. No invented numbers.
  const totalLessons = (courses.data ?? []).reduce((n, c) => n + (c.lessons?.length ?? 0), 0);
  const liveStats = [
    { icon: BookOpen, label: t("stats.courses", "Courses"), value: String(courses.data?.length ?? 0) },
    ...(totalLessons > 0 ? [{ icon: GraduationCap, label: t("stats.lessons", "Lessons"), value: String(totalLessons) }] : []),
    { icon: Globe, label: t("stats.languages", "Languages"), value: String(LANGS.length) },
    { icon: Gift, label: t("stats.cost", "Cost to learn"), value: t("stats.free", "Free") },
  ];

  return (
    <SiteLayout>
      <div className="border-b border-border bg-gradient-to-b from-primary-soft/40 via-primary-soft/10 to-background">
      <section className="container-page grid items-center gap-10 py-12 md:grid-cols-2 md:py-20">
        <div>
          {page.isLoading ? (
            <div className="space-y-4"><Skeleton className="h-14 w-full" /><Skeleton className="h-14 w-4/5" /><Skeleton className="h-20 w-full" /></div>
          ) : (
            <>
              <h1 className="whitespace-pre-line text-4xl leading-[1.05] md:text-6xl">
                {page.data?.hero_title || t("home.hero.title", "Learn more.\nDo more.\nTake part.")}
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                {page.data?.hero_subline || t("home.hero.sub", "Build confidence online and in your community. Learn practical digital skills, understand public services, and discover how to make your voice heard.")}
              </p>
            </>
          )}
          <div className="mt-8">
            <Button asChild variant="accent" size="lg"><Link to="/signup">{t("home.hero.cta", "Start Learning")}<ArrowRight /></Link></Button>
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
      </div>

      <PathwaySelector items={pathways.data ?? []} />

      {courses.data && courses.data.length > 0 && (
        <section aria-label="Platform at a glance" className="border-y border-border bg-primary text-primary-foreground">
          <dl ref={statsReveal} className="db-reveal container-page grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
            {liveStats.map((s) => (
              <div key={s.label} className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:gap-3 sm:text-left">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/10 text-accent"><s.icon className="size-5" aria-hidden="true" /></span>
                <span>
                  <dd className="font-display text-3xl font-extrabold text-accent">{s.value}</dd>
                  <dd className="text-sm opacity-90">{s.label}</dd>
                </span>
              </div>
            ))}
          </dl>
        </section>
      )}

      {Array.isArray(body.why) && body.why.length > 0 && (
        <section className="container-page py-16 md:py-20">
          <div className="max-w-2xl">
            <p className="eyebrow">{t("home.why.eyebrow", "Why this platform")}</p>
            <h2 className="mt-2 text-3xl md:text-4xl">{t("home.why.title", "Made for the way people here use phones")}</h2>
            <p className="mt-3 text-lg text-muted-foreground">
              {t("home.why.sub", "Short, plain-language lessons that work on any handset, built with communities, not for a classroom far away.")}
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
            <p className="eyebrow">{t("nav.courses", "Courses")}</p>
            <h2 className="mt-2 text-3xl">{t("home.courses.title", "Start With Something Useful")}</h2>
          </div>
          <Link to="/courses" className="hidden font-semibold text-primary hover:underline sm:inline">{t("home.courses.all", "All courses")}</Link>
        </div>
        <div ref={coursesReveal} className="db-reveal mt-8">
          {courses.isLoading ? <CardsSkeleton /> : courses.isError ? <ErrorNote /> : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {mixPathways(courses.data ?? [], 4).map((c, i) => <CourseCard key={c.id} course={c} index={i} />)}
            </div>
          )}
        </div>
      </section>

      {Array.isArray(body.steps) && body.steps.length > 0 && (
        <HowItWorks
          eyebrow={t("home.how.eyebrow", "How it works")}
          title={t("home.how.title", "Three steps to get going")}
          steps={body.steps as { title: string; body: string }[]}
        />
      )}

      <Testimonials items={testimonials.data ?? []} />

      <FaqSection items={faqs.data ?? []} />

      <Partners items={partners.data ?? []} />

      {/* Closing call to action */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-accent/20 blur-2xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 size-72 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div className="container-page relative py-16 text-center md:py-20">
          <h2 className="font-display text-3xl font-extrabold md:text-4xl">{t("home.cta.title", "Start learning today. It is free.")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-lg opacity-90">
            {t("home.cta.sub", "Make a free account in a minute and pick up on any phone. No fees, ever, for learners and community groups.")}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="accent" size="lg"><Link to="/signup">{t("home.hero.cta", "Start Learning")}<ArrowRight /></Link></Button>
            <Button asChild size="lg" className="border border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/for-trainers">{t("home.runworkshop", "Run a workshop")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <FeatureStrip />
    </SiteLayout>
  );
}
