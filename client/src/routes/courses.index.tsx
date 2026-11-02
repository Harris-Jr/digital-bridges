import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Lock, ArrowRight, PlayCircle, CheckCircle2, Compass } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { ContentImage } from "@/components/site";
import { getToken } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SiteLayout, CourseCard, CardsSkeleton, ErrorNote, EmptyState, PageHero } from "@/components/site";
import { useI18n } from "@/lib/i18n";
import { coursePct, difficultyLabel, pickContinue, useCategories, useMyProgress, usePublishedCourses, usePathways, type Course } from "@/lib/content";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { seo } from "@/lib/seo";

const SAMPLE_PER_PATHWAY = 3;

export const Route = createFileRoute("/courses/")({
  validateSearch: (s: Record<string, unknown>): { q?: string; tab?: "mine" | "explore" } => ({
    q: typeof s.q === "string" && s.q.trim() ? s.q.trim() : undefined,
    tab: s.tab === "mine" || s.tab === "explore" ? s.tab : undefined,
  }),
  head: () => seo({
    path: "/courses",
    title: "Free digital and civic courses | Civic Wise",
    description: "Browse free Civic Wise courses in simple language: phone basics, online safety, mobile money, spotting false news, finding work, your rights and taking part in your community. Works on any phone.",
  }),
  component: CoursesPage,
});

/* Signed out: the public catalogue (sample per pathway + sign-up prompt).
   Signed in: the learner's own course area inside the app shell, with
   "My courses" (continue, in progress, completed) and "Explore" (search and
   filters), the same split Teachable, NetAcad and Coursera use. */
function CoursesPage() {
  const { user, loading } = useAuth();
  if (user || (loading && getToken())) return <AppShell><MyCourses /></AppShell>;
  return <PublicCourses />;
}

function PublicCourses() {
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

/* ------------------------------------------------------------ signed in */

function MyCourses() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate({ from: "/courses/" });
  const { tab: tabParam, q: qParam } = Route.useSearch();
  const courses = usePublishedCourses();
  const pathways = usePathways();
  const cats = useCategories();
  const progress = useMyProgress(user?.id);

  const list = courses.data ?? [];
  const done = useMemo(() => new Set(progress.data?.map((p) => p.lesson_id)), [progress.data]);
  const started = list.filter((c) => coursePct(c, done) > 0);
  const inProgress = started.filter((c) => coursePct(c, done) < 100);
  const completed = started.filter((c) => coursePct(c, done) === 100);
  const cont = pickContinue(list, progress.data ?? []);

  // Default tab: "My courses" once the learner has started something.
  const tab = tabParam ?? (qParam ? "explore" : started.length ? "mine" : "explore");
  const setTab = (next: "mine" | "explore") => navigate({ search: (s) => ({ ...s, tab: next }), replace: true });

  const [q, setQ] = useState(qParam ?? "");
  const [path, setPath] = useState<string | null>(null);
  const [level, setLevel] = useState("");
  const [cat, setCat] = useState("");
  const [status, setStatus] = useState<"all" | "new" | "started" | "done">("all");
  useEffect(() => { if (qParam !== undefined) setQ(qParam); }, [qParam]);

  const results = useMemo(() => list.filter((c) => {
    const pct = coursePct(c, done);
    const text = `${c.title} ${c.tagline} ${c.description}`.toLowerCase();
    return (!q.trim() || text.includes(q.trim().toLowerCase()))
      && (!path || c.pathway?.slug === path)
      && (!level || c.difficulty === level)
      && (!cat || c.category_id === cat)
      && (status === "all" || (status === "new" && pct === 0) || (status === "started" && pct > 0 && pct < 100) || (status === "done" && pct === 100));
  }), [list, done, q, path, level, cat, status]);
  const anyFilter = !!(q.trim() || path || level || cat || status !== "all");
  const clear = () => { setQ(""); setPath(null); setLevel(""); setCat(""); setStatus("all"); };

  const card = (c: Course) => <CourseCard key={c.id} course={c} progress={coursePct(c, done)} />;
  const select = "h-11 rounded-full border border-input bg-card px-4 text-sm font-medium";

  return (
    <section className="container-page py-10 md:py-12">
      <h1 className="text-3xl md:text-4xl">{t("nav.courses", "Courses")}</h1>
      <p className="mt-2 text-muted-foreground">{t("courses.mySub", "Pick up where you left off, or find something new.")}</p>

      <div role="tablist" aria-label={t("nav.courses", "Courses")} className="mt-6 inline-flex rounded-full border border-border bg-card p-1">
        {([["mine", t("courses.tabMine", "My courses"), started.length], ["explore", t("courses.tabExplore", "Explore"), list.length]] as const).map(([k, label, n]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={cn("inline-flex min-h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors", tab === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
            {label}
            <span className={cn("rounded-full px-2 text-xs", tab === k ? "bg-primary-foreground/20" : "bg-secondary")}>{n}</span>
          </button>
        ))}
      </div>

      {courses.isLoading || progress.isLoading ? (
        <div className="mt-8"><CardsSkeleton n={6} /></div>
      ) : courses.isError ? (
        <div className="mt-8"><ErrorNote /></div>
      ) : tab === "mine" ? (
        <div className="mt-8 space-y-12">
          {cont && cont.started && (
            <div className="grid overflow-hidden rounded-2xl border border-border bg-card shadow-sm md:grid-cols-[240px_1fr]">
              <div className="h-36 md:h-auto"><ContentImage src={cont.course.image_url} icon={cont.course.icon_name} motif={cont.course.categories?.slug} alt="" /></div>
              <div className="p-6">
                <p className="eyebrow">{t("cta.continue", "Continue learning")}</p>
                <h2 className="mt-1 text-2xl">{cont.course.title}</h2>
                <div className="mt-3 flex max-w-sm items-center gap-3">
                  <div className="h-2 flex-1 rounded-full bg-secondary"><div className="h-2 rounded-full bg-success" style={{ width: `${cont.pct}%` }} /></div>
                  <span className="text-sm font-semibold text-muted-foreground">{cont.pct}%</span>
                </div>
                <Button asChild variant="accent" className="mt-4">
                  {cont.lessonSlug
                    ? <Link to="/learn/$courseSlug/$lessonSlug" params={{ courseSlug: cont.course.slug, lessonSlug: cont.lessonSlug }}><PlayCircle />{t("courses.resume", "Resume")}</Link>
                    : <Link to="/courses/$slug" params={{ slug: cont.course.slug }}><PlayCircle />{t("courses.resume", "Resume")}</Link>}
                </Button>
              </div>
            </div>
          )}

          {started.length === 0 ? (
            <EmptyState icon="Compass" title={t("courses.noneStarted", "You have not started a course yet")}
              body={t("courses.noneStartedBody", "Explore the courses and pick one. Start with Getting to Know Your Device if you are new to phones.")}
              action={<Button onClick={() => setTab("explore")}><Compass className="size-4" />{t("courses.tabExplore", "Explore")}</Button>} />
          ) : (
            <>
              {inProgress.length > 0 && (
                <div>
                  <h2 className="flex items-center gap-2 text-2xl"><PlayCircle className="size-6 text-primary" aria-hidden="true" />{t("courses.inProgress", "In progress")}</h2>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{inProgress.map(card)}</div>
                </div>
              )}
              {completed.length > 0 && (
                <div>
                  <h2 className="flex items-center gap-2 text-2xl"><CheckCircle2 className="size-6 text-success" aria-hidden="true" />{t("courses.completed", "Completed")}</h2>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{completed.map(card)}</div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="mt-8">
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
            <label className="relative block">
              <span className="sr-only">{t("courses.search", "Search courses")}</span>
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("courses.search", "Search courses")} className="h-11 rounded-full bg-background pl-10" />
            </label>
            <div role="group" aria-label={t("courses.pathway", "Pathway")} className="flex flex-wrap gap-2">
              <Pill active={!path} onClick={() => setPath(null)}>{t("courses.all", "All")}</Pill>
              {pathways.data?.map((p) => <Pill key={p.id} active={path === p.slug} onClick={() => setPath(p.slug)}>{p.title}</Pill>)}
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <select name="level" aria-label={t("courses.level", "Level")} value={level} onChange={(e) => setLevel(e.target.value)} className={select}>
                <option value="">{t("courses.anyLevel", "Any level")}</option>
                {Object.entries(difficultyLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <select name="topic" aria-label={t("courses.topic", "Topic")} value={cat} onChange={(e) => setCat(e.target.value)} className={select}>
                <option value="">{t("courses.anyTopic", "Any topic")}</option>
                {cats.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select name="status" aria-label={t("courses.status", "Status")} value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={select}>
                <option value="all">{t("courses.anyStatus", "Any status")}</option>
                <option value="new">{t("courses.notStarted", "Not started")}</option>
                <option value="started">{t("courses.inProgress", "In progress")}</option>
                <option value="done">{t("courses.completed", "Completed")}</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
            <span>{results.length} {results.length === 1 ? t("courses.course", "course") : t("courses.courses", "courses")}</span>
            {anyFilter && <button onClick={clear} className="font-semibold text-primary underline">{t("courses.clear", "Clear filters")}</button>}
          </div>

          {results.length === 0 ? (
            <div className="mt-4"><EmptyState icon="SearchX" title={t("courses.nomatch", "No courses match")} body={t("courses.nomatchBody", "Try a different word, or show all topics.")} action={<Button variant="outline" onClick={clear}>{t("courses.showall", "Show all courses")}</Button>} /></div>
          ) : (
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{results.map(card)}</div>
          )}
        </div>
      )}
    </section>
  );
}
