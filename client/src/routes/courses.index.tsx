import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Lock, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SiteLayout, CourseCard, CardsSkeleton, ErrorNote, EmptyState, PageHero } from "@/components/site";
import { useI18n } from "@/lib/i18n";
import { useCategories, useMyProgress, usePublishedCourses, usePathways, type Course } from "@/lib/content";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const SAMPLE_PER_PATHWAY = 3;

export const Route = createFileRoute("/courses/")({
  validateSearch: (s: Record<string, unknown>): { q?: string } => ({
    q: typeof s.q === "string" && s.q.trim() ? s.q.trim() : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Courses — Civic Wise" },
      { name: "description", content: "Eight free courses: phone basics, online safety, mobile money, spotting false news, work skills and selling online." },
      { property: "og:title", content: "Courses — Civic Wise" },
      { property: "og:description", content: "Eight free digital skills courses in simple language." },
    ],
  }),
  component: CoursesPage,
});

function CoursesPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { q: qParam } = Route.useSearch();
  const courses = usePublishedCourses();
  const pathways = usePathways();
  const cats = useCategories();
  const progress = useMyProgress(user?.id);
  const [cat, setCat] = useState<string | null>(null);
  const [q, setQ] = useState(qParam ?? "");

  // Keep the box in sync when the nav search navigates here with a new ?q=.
  useEffect(() => { if (qParam !== undefined) setQ(qParam); }, [qParam]);
  const done = new Set(progress.data?.map((p) => p.lesson_id));

  const filtering = !!(cat || q.trim());
  // Signed-out visitors browsing (not searching) see a sample per pathway and a
  // prompt to sign in for the full catalogue. Signed-in, or anyone searching or
  // filtering, sees every matching course.
  const sampleMode = !user && !filtering;

  const list = useMemo(
    () =>
      (courses.data ?? []).filter(
        (c) =>
          (!cat || c.category_id === cat) &&
          (!q || (c.title + c.tagline).toLowerCase().includes(q.toLowerCase())),
      ),
    [courses.data, cat, q],
  );

  // Group the (filtered) list by pathway, in the pathways' own order.
  const groups = useMemo(() => {
    const byPath = new Map<string, Course[]>();
    for (const c of list) {
      const slug = c.pathway?.slug ?? "other";
      (byPath.get(slug) ?? byPath.set(slug, []).get(slug)!).push(c);
    }
    const ordered = (pathways.data ?? [])
      .filter((p) => byPath.has(p.slug))
      .map((p) => ({ slug: p.slug, title: p.title, subtitle: p.subtitle, all: byPath.get(p.slug)! }));
    // any courses whose pathway is missing from the list, appended last
    for (const [slug, arr] of byPath) {
      if (!ordered.some((g) => g.slug === slug)) ordered.push({ slug, title: t("courses.more", "More courses"), subtitle: "", all: arr });
    }
    return ordered;
  }, [list, pathways.data, t]);

  const cardFor = (c: Course) => {
    const total = c.lessons?.length ?? 0;
    const d = c.lessons?.filter((l) => done.has(l.id)).length ?? 0;
    return <CourseCard key={c.id} course={c} progress={user && total ? Math.round((d / total) * 100) : undefined} />;
  };

  return (
    <SiteLayout>
      <PageHero eyebrow={t("nav.courses", "Courses")} title={t("courses.title", "Pick what you want to learn")} sub={t("courses.sub", "Every course is free, short and written in plain language. If you are new to phones, begin with course 1.")} />
      <section className="container-page py-12 md:py-16">
        {/* Filters + search: shown to signed-in learners and whenever searching. */}
        {!sampleMode && (
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div role="group" aria-label="Filter by topic" className="flex flex-wrap gap-2">
              <Pill active={!cat} onClick={() => setCat(null)}>{t("courses.all", "All")}</Pill>
              {cats.data?.map((c) => (
                <Pill key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>{c.name}</Pill>
              ))}
            </div>
            <label className="relative block md:w-72">
              <span className="sr-only">{t("courses.search", "Search courses")}</span>
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("courses.search", "Search courses")} className="h-11 rounded-full bg-card pl-10" />
            </label>
          </div>
        )}

        {courses.isLoading ? (
          <div className="mt-8"><CardsSkeleton n={8} /></div>
        ) : courses.isError ? (
          <div className="mt-8"><ErrorNote /></div>
        ) : list.length === 0 ? (
          <div className="mt-8"><EmptyState icon="SearchX" title={t("courses.nomatch", "No courses match")} body={t("courses.nomatchBody", "Try a different word, or show all topics.")} action={<Button variant="outline" onClick={() => { setQ(""); setCat(null); }}>{t("courses.showall", "Show all courses")}</Button>} /></div>
        ) : (
          <div className={cn("space-y-14", !sampleMode && "mt-10")}>
            {groups.map((g) => {
              const shown = sampleMode ? g.all.slice(0, SAMPLE_PER_PATHWAY) : g.all;
              const hidden = g.all.length - shown.length;
              return (
                <div key={g.slug}>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <h2 className="text-2xl">{g.title}</h2>
                      {g.subtitle && <p className="mt-1 text-sm text-muted-foreground">{g.subtitle}</p>}
                    </div>
                    <span className="shrink-0 text-sm text-muted-foreground">{g.all.length} {g.all.length === 1 ? t("courses.course", "course") : t("courses.courses", "courses")}</span>
                  </div>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {shown.map(cardFor)}
                    {sampleMode && hidden > 0 && (
                      <Link
                        to="/signup"
                        className="group flex min-h-56 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card/50 p-6 text-center transition-colors hover:border-primary hover:bg-primary-soft/30"
                      >
                        <span className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary"><Lock className="size-5" /></span>
                        <p className="font-display text-lg font-bold text-primary">+{hidden} {t("courses.more.word", "more")}</p>
                        <p className="text-sm text-muted-foreground">{t("courses.more.sub", "Create a free account to open every course.")}</p>
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">{t("nav.signin", "Sign in")}<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}

            {sampleMode && (
              <div className="rounded-2xl border border-primary/20 bg-primary-soft/40 p-6 text-center md:p-8">
                <h3 className="font-display text-xl font-bold text-primary md:text-2xl">{t("courses.cta.title", "See every course, free")}</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{t("courses.cta.sub", "Make a free account to open the full catalogue, save your progress, and learn offline on any phone.")}</p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <Button asChild variant="accent" size="lg"><Link to="/signup">{t("nav.start", "Start learning")}<ArrowRight /></Link></Button>
                  <Button asChild variant="outline" size="lg"><Link to="/signin">{t("nav.signin", "Sign in")}</Link></Button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn("min-h-11 rounded-full border px-4 text-sm font-semibold", active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary")}
    >
      {children}
    </button>
  );
}
