import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Circle, ChevronRight, Clock, BookOpen, HelpCircle, Hand, Download, Loader2, Check, Trash2, WifiOff, Compass } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteLayout, ContentImage, ErrorNote, EmptyState, Icon, CourseCard } from "@/components/site";
import { difficultyLabel, useCourse, useMyProgress, usePublishedCourses, type Lesson } from "@/lib/content";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { downloadPack, removePack, isDownloaded, offlineSupported } from "@/lib/offline";

export const Route = createFileRoute("/courses/$slug")({
  head: ({ params }) => {
    const name = params.slug.split("-").map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" ");
    return {
      meta: [
        { title: `${name} — Digital Bridges` },
        { name: "description", content: `Free course: ${name}. Short lessons in simple language.` },
        { property: "og:title", content: `${name} — Digital Bridges` },
        { property: "og:description", content: `Free course: ${name}. Short lessons in simple language.` },
      ],
    };
  },
  component: CourseDetail,
});

const typeIcon = { read: BookOpen, quiz: HelpCircle, practice: Hand, scenario: Compass };

function CourseDetail() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const { t } = useI18n();
  const course = useCourse(slug);
  const all = usePublishedCourses();
  const progress = useMyProgress(user?.id);
  const done = new Set(progress.data?.map((p) => p.lesson_id));

  if (course.isLoading)
    return <SiteLayout><div className="container-page space-y-4 py-16"><Skeleton className="h-10 w-2/3" /><Skeleton className="h-40 w-full rounded-2xl" /></div></SiteLayout>;
  if (course.isError) return <SiteLayout><div className="container-page py-16"><ErrorNote /></div></SiteLayout>;
  const c = course.data;
  if (!c || !c.is_published)
    return (
      <SiteLayout>
        <div className="container-page py-16">
          <EmptyState icon="BookX" title="This course is not available" body="It may have been moved or is being updated." action={<Button asChild><Link to="/courses">See all courses</Link></Button>} />
        </div>
      </SiteLayout>
    );
  const next = c.lessons.find((l) => !done.has(l.id)) ?? c.lessons[0];
  const related = all.data?.filter((x) => x.id !== c.id && x.category_id === c.category_id)[0] ?? all.data?.find((x) => x.id !== c.id);
  const relatedIdx = related ? (all.data ?? []).findIndex((x) => x.id === related.id) : 0;
  const completed = c.lessons.filter((l) => done.has(l.id)).length;

  return (
    <SiteLayout>
      <div className="container-page pt-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">{t("nav.home", "Home")}</Link><ChevronRight className="size-4" aria-hidden="true" />
          <Link to="/courses" className="hover:text-foreground">{t("nav.courses", "Courses")}</Link><ChevronRight className="size-4" aria-hidden="true" />
          <span aria-current="page" className="text-foreground">{c.title}</span>
        </nav>
      </div>
      <section className="container-page grid gap-10 py-10 md:grid-cols-[1fr_320px]">
        <div>
          <div className="flex items-center gap-2 text-sm">
            <Icon name={c.icon_name} className="size-5 text-primary" />
            <span className="font-semibold text-primary">{c.categories?.name}</span>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold">{difficultyLabel[c.difficulty]}</span>
          </div>
          <h1 className="mt-3 text-3xl md:text-5xl">{c.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{c.description}</p>
          <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1"><BookOpen className="size-4" aria-hidden="true" />{c.lessons.length} {t("course.lessons", "lessons")}</span>
            <span className="inline-flex items-center gap-1"><Clock className="size-4" aria-hidden="true" />{c.estimated_hours} {t("course.hours", "hours")}</span>
          </div>

          {Array.isArray(c.outcomes) && c.outcomes.length > 0 && (
            <div className="mt-10">
              <h2 className="text-2xl">{t("course.outcomes", "What you will be able to do")}</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {c.outcomes.map((o) => (
                  <li key={o} className="flex items-start gap-2"><CheckCircle2 className="mt-1 size-5 shrink-0 text-success" aria-hidden="true" />{o}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-10">
            <h2 className="text-2xl">{t("course.lessonsHeading", "Lessons")}</h2>
            {c.lessons.length === 0 ? (
              <p className="mt-4 text-muted-foreground">{t("course.lessonsEmpty", "Lessons for this course are being written. Check back soon.")}</p>
            ) : (
              <ol className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                {c.lessons.map((l, i) => {
                  const T = typeIcon[l.type];
                  const isDone = done.has(l.id);
                  return (
                    <li key={l.id}>
                      <Link to="/learn/$courseSlug/$lessonSlug" params={{ courseSlug: c.slug, lessonSlug: l.slug }} className="flex min-h-14 items-center gap-4 px-5 py-3 hover:bg-secondary">
                        {isDone ? <CheckCircle2 className="size-5 text-success" aria-label="Done" /> : <Circle className="size-5 text-muted-foreground" aria-label="Not done" />}
                        <span className="flex-1"><span className="text-muted-foreground">{i + 1}. </span>{l.title}</span>
                        <span className="inline-flex items-center gap-1 text-xs capitalize text-muted-foreground"><T className="size-4" aria-hidden="true" />{l.type}</span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>
        <aside className="md:sticky md:top-24 md:self-start">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="h-40"><ContentImage src={c.image_url} motif={c.categories?.slug} alt="" /></div>
            <div className="p-5">
              {user && <p className="text-sm text-muted-foreground">{completed} {t("course.of", "of")} {c.lessons.length} {t("course.lessonsDone", "lessons done")}</p>}
              {next && (
                <Button asChild variant="accent" className="mt-3 w-full">
                  <Link to="/learn/$courseSlug/$lessonSlug" params={{ courseSlug: c.slug, lessonSlug: next.slug }}>
                    {completed > 0 ? t("course.continue", "Continue course") : t("course.start", "Start course")}
                  </Link>
                </Button>
              )}
              {!user && <p className="mt-3 text-xs text-muted-foreground"><Link to="/signup" className="font-semibold text-primary underline">{t("course.createAccount", "Create a free account")}</Link> {t("course.toSave", "to save your progress.")}</p>}
              {c.lessons.length > 0 && <OfflineDownload slug={c.slug} title={c.title} image_url={c.image_url} lessons={c.lessons} />}
            </div>
          </div>
          {related && (
            <div className="mt-6">
              <p className="mb-3 text-sm font-semibold">{t("course.related", "You might also like")}</p>
              <CourseCard course={related} index={relatedIdx} />
            </div>
          )}
        </aside>
      </section>
    </SiteLayout>
  );
}

function OfflineDownload({ slug, title, image_url, lessons }: { slug: string; title: string; image_url: string | null; lessons: Lesson[] }) {
  const { t } = useI18n();
  const [saved, setSaved] = useState(() => isDownloaded(slug));
  const [pct, setPct] = useState<number | null>(null);
  const course = { slug, title, image_url, lessons };

  // Only shown once a service worker controls the page (production/installed PWA).
  if (!offlineSupported() && !saved) {
    return <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><WifiOff className="size-3.5" aria-hidden="true" />{t("offline.installedOnly", "Offline download works in the installed app.")}</p>;
  }

  const start = async () => {
    setPct(0);
    const ok = await downloadPack(course, (d, total) => setPct(Math.round((d / total) * 100)));
    setPct(null);
    if (ok) { setSaved(true); toast.success(t("offline.saved", "This course is saved for offline use.")); }
    else toast.error(t("offline.saveFail", "Could not save this course for offline use."));
  };
  const remove = async () => { await removePack(course); setSaved(false); toast.success(t("offline.removed", "Removed from offline storage.")); };

  if (pct !== null)
    return (
      <div className="mt-3">
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" aria-hidden="true" />{t("offline.saving", "Saving for offline…")} {pct}%</p>
        <div className="mt-2 h-1.5 rounded-full bg-secondary"><div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} /></div>
      </div>
    );

  if (saved)
    return (
      <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-success/40 bg-primary-soft px-3 py-2">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-success"><Check className="size-4" aria-hidden="true" />{t("offline.available", "Available offline")}</span>
        <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground" onClick={remove}><Trash2 className="size-4" />{t("offline.remove", "Remove")}</Button>
      </div>
    );

  return (
    <Button variant="outline" className="mt-3 w-full" onClick={start}><Download className="size-4" />{t("offline.download", "Download for offline")}</Button>
  );
}
