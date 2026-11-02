import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Flame, BookOpenCheck, ArrowRight, Award, Users, MapPin, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressRing, BadgeMedal, CourseCard, EmptyState, ContentImage } from "@/components/site";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { computeStreak, coursePct, pickContinue, useMyBadges, useMyProgress, usePublishedCourses, useMyCertificates, useMyLearnerCohorts } from "@/lib/content";
import { ShareDialog, type Shareable } from "@/components/share";
import { apiPost } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "My learning, Civic Wise" },
      { name: "description", content: "Your progress, streak and badges on Civic Wise." },
      { property: "og:title", content: "My learning, Civic Wise" },
      { property: "og:description", content: "Your progress, streak and badges." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user, profile } = useAuth();
  const { t } = useI18n();
  const courses = usePublishedCourses();
  const progress = useMyProgress(user?.id);
  const certificates = useMyCertificates(user?.id);
  const myCohorts = useMyLearnerCohorts(user?.id);
  const qc = useQueryClient();
  const [joinCode, setJoinCode] = useState("");
  const join = useMutation({
    mutationFn: () => apiPost<{ name: string }>("/me/join-cohort", { code: joinCode.trim().toUpperCase() }),
    onSuccess: (r) => { toast.success(`You joined ${r.name}.`); setJoinCode(""); qc.invalidateQueries({ queryKey: ["my-cohorts"] }); },
    onError: (e: Error) => toast.error(e.message || "That code did not match a cohort."),
  });
  const badges = useMyBadges(user?.id);
  const [sharing, setSharing] = useState<Shareable | null>(null);
  const learnerName = profile?.full_name?.trim() || "Civic Wise learner";

  if (courses.isLoading || progress.isLoading)
    return <><div className="container-page space-y-4 py-12"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-40 w-full rounded-2xl" /></div></>;

  const list = courses.data ?? [];
  const done = new Set(progress.data?.map((p) => p.lesson_id));
  const totalLessons = list.reduce((n, c) => n + (c.lessons?.length ?? 0), 0);
  const doneCount = list.reduce((n, c) => n + (c.lessons?.filter((l) => done.has(l.id)).length ?? 0), 0);
  const pct = totalLessons ? Math.round((doneCount / totalLessons) * 100) : 0;
  const streak = computeStreak((progress.data ?? []).map((p) => p.completed_at));
  const pctOf = (c: (typeof list)[number]) => coursePct(c, done);
  const notStarted = list.filter((c) => pctOf(c) === 0);
  const cont = pickContinue(list, progress.data ?? []);
  const continueCourse = cont?.course;
  const inProgress = cont?.started;
  const firstName = profile?.full_name?.split(" ")[0];

  return (
    <>
      <section className="container-page py-12">
        <h1 className="text-3xl md:text-4xl">{t("greeting", "Moni")}{firstName ? `, ${firstName}` : ""}</h1>
        <p className="mt-2 text-muted-foreground">{t("dash.sub", "Here is how your learning is going.")}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="flex items-center gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <ProgressRing value={pct} />
            <div><p className="font-semibold">{t("dash.allcourses", "All courses")}</p><p className="text-sm text-muted-foreground">{doneCount} {t("course.of", "of")} {totalLessons} {t("course.lessons", "lessons")}</p></div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <Flame className="size-7 text-warning" aria-hidden="true" />
            <p className="mt-3 font-display text-3xl font-extrabold">{streak} {streak === 1 ? "day" : "days"}</p>
            <p className="text-sm text-muted-foreground">{t("dash.streak", "Learning streak")}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <BookOpenCheck className="size-7 text-success" aria-hidden="true" />
            <p className="mt-3 font-display text-3xl font-extrabold">{doneCount}</p>
            <p className="text-sm text-muted-foreground">{t("dash.completed", "Lessons completed")}</p>
          </div>
        </div>

        {continueCourse && (
          <div className="mt-8 grid overflow-hidden rounded-2xl border border-border bg-card shadow-sm md:grid-cols-[240px_1fr]">
            <div className="h-36 md:h-auto"><ContentImage src={continueCourse.image_url} icon={continueCourse.icon_name} motif={continueCourse.categories?.slug} alt="" /></div>
            <div className="p-6">
              <p className="eyebrow">{inProgress ? t("cta.continue", "Continue learning") : t("dash.starthere", "Start here")}</p>
              <h2 className="mt-1 text-2xl">{continueCourse.title}</h2>
              <p className="mt-1 text-muted-foreground">{continueCourse.tagline}</p>
              <div className="mt-3 h-2 max-w-sm rounded-full bg-secondary"><div className="h-2 rounded-full bg-success" style={{ width: `${pctOf(continueCourse)}%` }} /></div>
              <Button asChild variant="accent" className="mt-4">
                {cont?.lessonSlug
                  ? <Link to="/learn/$courseSlug/$lessonSlug" params={{ courseSlug: continueCourse.slug, lessonSlug: cont.lessonSlug }}>{inProgress ? t("cta.continue", "Continue learning") : t("course.start", "Start course")}<ArrowRight /></Link>
                  : <Link to="/courses/$slug" params={{ slug: continueCourse.slug }}>{inProgress ? t("cta.continue", "Continue learning") : t("course.start", "Start course")}<ArrowRight /></Link>}
              </Button>
            </div>
          </div>
        )}

        <div className="mt-10">
          <h2 className="text-2xl">{t("dash.badges", "Your badges")}</h2>
          {badges.data && badges.data.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
              {badges.data.map((b) => (
                <BadgeMedal key={b.id} icon={b.icon_name} earned={b.earned} label={b.name}
                  onClick={() => setSharing({ kind: "badge", key: b.id, title: b.name, learnerName, issuedAt: b.earned_at, isPublic: b.is_public, publicId: b.share_id })} />
              ))}
            </div>
          ) : (
            <div className="mt-4"><EmptyState icon="Award" title="No badges yet" body="Finish your first lesson to earn the First Lesson badge." /></div>
          )}
        </div>

        {certificates.data && certificates.data.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl">{t("dash.certificates", "Your certificates")}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {certificates.data.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <div className="min-w-0">
                    <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-success"><Award className="size-4" />{t("dash.completedBadge", "Completed")}</p>
                    <p className="mt-1 truncate font-semibold">{cert.course_title}</p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <Button variant="ghost" size="icon" aria-label={t("share.title", "Share")}
                      onClick={() => setSharing({ kind: "certificate", key: cert.course_slug, title: cert.course_title, learnerName, issuedAt: cert.issued_at, isPublic: cert.is_public, publicId: cert.id })}>
                      <Share2 className="size-4" />
                    </Button>
                    <Button asChild variant="outline" size="sm"><Link to="/certificates/$slug" params={{ slug: cert.course_slug }}>{t("dash.view", "View")}</Link></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10">
          <h2 className="text-2xl">{t("dash.cohorts", "Your cohorts")}</h2>
          <p className="mt-1 text-muted-foreground">{t("dash.cohortsSub", "Learning with a facilitator? Enter the join code they gave you.")}</p>
          <form
            className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
            onSubmit={(e) => { e.preventDefault(); if (joinCode.trim()) join.mutate(); }}
          >
            <div className="flex-1 min-w-48">
              <label htmlFor="join" className="text-sm font-medium">{t("cohort.joincode", "Join code")}</label>
              <Input id="join" className="mt-1 h-11 uppercase tracking-[0.2em]" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="ABC123" maxLength={12} />
            </div>
            <Button type="submit" disabled={join.isPending}><Users className="size-4" />{t("cohort.join", "Join cohort")}</Button>
          </form>
          {myCohorts.data && myCohorts.data.length > 0 && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {myCohorts.data.map((c) => (
                <div key={c.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <p className="font-semibold">{c.name}</p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="size-4" aria-hidden="true" />{c.location}</p>
                  {c.facilitator && <p className="mt-1 text-sm text-muted-foreground">{t("cohort.facilitator", "Facilitator")}: {c.facilitator}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {notStarted.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl">{t("dash.recommended", "Recommended for you")}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {notStarted.filter((c) => c.id !== continueCourse?.id).slice(0, 3).map((c) => (
                <CourseCard key={c.id} course={c} index={list.findIndex((x) => x.id === c.id)} />
              ))}
            </div>
          </div>
        )}
      </section>
      <ShareDialog item={sharing} open={!!sharing} onOpenChange={(o) => !o && setSharing(null)} />
    </>
  );
}
