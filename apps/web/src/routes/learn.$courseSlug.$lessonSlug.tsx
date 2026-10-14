import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, CheckCircle2, Lightbulb, Hand, X, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ContentImage, EmptyState, ErrorNote, RichText } from "@/components/site";
import { useCourse, useMyProgress, computeStreak, type QuizQuestion } from "@/lib/content";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/learn/$courseSlug/$lessonSlug")({
  head: () => ({
    meta: [
      { title: "Lesson — Digital Bridges" },
      { name: "description", content: "A short Digital Bridges lesson in simple language." },
      { property: "og:title", content: "Lesson — Digital Bridges" },
      { property: "og:description", content: "A short Digital Bridges lesson in simple language." },
    ],
  }),
  component: LessonPlayer,
});

async function awardBadges(userId: string) {
  const [{ data: prog }, { data: badges }, { data: courses }] = await Promise.all([
    supabase.from("lesson_progress").select("lesson_id,completed_at"),
    supabase.from("badges").select("id,slug,criteria"),
    supabase.from("courses").select("slug, lessons(id,is_published)").eq("is_published", true),
  ]);
  const done = new Set((prog ?? []).map((p) => p.lesson_id));
  const streak = computeStreak((prog ?? []).map((p) => p.completed_at));
  const earned: string[] = [];
  for (const b of badges ?? []) {
    const cr = (b.criteria ?? {}) as { lessons?: number; course?: string; streak?: number };
    let ok = false;
    if (cr.lessons) ok = done.size >= cr.lessons;
    if (cr.streak) ok = streak >= cr.streak;
    if (cr.course) {
      const c = (courses ?? []).find((x) => x.slug === cr.course) as { lessons: { id: string; is_published: boolean }[] } | undefined;
      const ls = c?.lessons.filter((l) => l.is_published) ?? [];
      ok = ls.length > 0 && ls.every((l) => done.has(l.id));
    }
    if (ok) earned.push(b.id);
  }
  if (earned.length) {
    const { data: existing } = await supabase.from("user_badges").select("badge_id");
    const have = new Set((existing ?? []).map((e) => e.badge_id));
    const fresh = earned.filter((id) => !have.has(id));
    if (fresh.length) {
      await supabase.from("user_badges").insert(fresh.map((badge_id) => ({ user_id: userId, badge_id })));
      return fresh.length;
    }
  }
  return 0;
}

function LessonPlayer() {
  const { courseSlug, lessonSlug } = Route.useParams();
  const { t } = useI18n();
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const course = useCourse(courseSlug);
  const progress = useMyProgress(user?.id);
  const lessons = course.data?.lessons ?? [];
  const idx = lessons.findIndex((l) => l.slug === lessonSlug);
  const lesson = idx >= 0 ? lessons[idx] : undefined;
  const isDone = !!lesson && !!progress.data?.some((p) => p.lesson_id === lesson.id);
  const [tab, setTab] = useState<"lesson" | "quiz">("lesson");
  useEffect(() => setTab(lesson?.type === "quiz" ? "quiz" : "lesson"), [lesson?.id, lesson?.type]);

  const quiz = useQuery({
    queryKey: ["quiz", lesson?.id],
    enabled: !!lesson,
    queryFn: async () => {
      const { data, error } = await supabase.from("quiz_questions").select("*").eq("lesson_id", lesson!.id).order("sort_order");
      if (error) throw error;
      return data as unknown as QuizQuestion[];
    },
  });

  const complete = useMutation({
    mutationFn: async () => {
      if (!user || !lesson) return 0;
      const { error } = await supabase.from("lesson_progress").upsert({ user_id: user.id, lesson_id: lesson.id }, { onConflict: "user_id,lesson_id", ignoreDuplicates: true });
      if (error) throw error;
      return awardBadges(user.id);
    },
    onMutate: async () => {
      if (!user || !lesson) return;
      qc.setQueryData(["progress", user.id], (old: { lesson_id: string; completed_at: string }[] | undefined) => [
        ...(old ?? []),
        { lesson_id: lesson.id, completed_at: new Date().toISOString() },
      ]);
    },
    onSuccess: (n) => {
      toast.success(n ? "Lesson done — you earned a new badge!" : "Lesson marked as done");
      qc.invalidateQueries({ queryKey: ["progress"] });
      qc.invalidateQueries({ queryKey: ["my-badges"] });
    },
    onError: () => {
      toast.error("We could not save that. Check your connection and try again.");
      qc.invalidateQueries({ queryKey: ["progress"] });
    },
  });

  if (course.isLoading) return <div className="container-page max-w-2xl space-y-4 py-10"><Skeleton className="h-4 w-full" /><Skeleton className="h-10 w-2/3" /><Skeleton className="h-64 w-full rounded-2xl" /></div>;
  if (course.isError) return <div className="container-page max-w-2xl py-10"><ErrorNote /></div>;
  if (!course.data || !lesson)
    return (
      <div className="container-page max-w-2xl py-16">
        <EmptyState icon="BookX" title="We could not find this lesson" body="It may have been moved or is being updated." action={<Button asChild><Link to="/courses">Back to courses</Link></Button>} />
      </div>
    );

  const prev = lessons[idx - 1];
  const next = lessons[idx + 1];
  const pct = Math.round(((idx + 1) / lessons.length) * 100);
  const hasQuiz = (quiz.data?.length ?? 0) > 0;

  const goNext = () => {
    if (user && !isDone) complete.mutate();
    if (next) navigate({ to: "/learn/$courseSlug/$lessonSlug", params: { courseSlug, lessonSlug: next.slug } });
    else navigate({ to: "/courses/$slug", params: { slug: courseSlug } });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <div className="container-page flex h-14 max-w-3xl items-center gap-3">
          <Button asChild variant="ghost" size="icon" aria-label="Close lesson"><Link to="/courses/$slug" params={{ slug: courseSlug }}><X /></Link></Button>
          <div className="flex-1">
            <div className="h-2 rounded-full bg-secondary" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Course progress">
              <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">{idx + 1}/{lessons.length}</span>
        </div>
      </header>

      <main id="main" className="container-page max-w-3xl py-8 pb-32">
        <p className="eyebrow">{course.data.title}</p>
        <h1 className="mt-2 text-3xl">{lesson.title}</h1>
        {isDone && <p className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-success"><CheckCircle2 className="size-4" aria-hidden="true" />Done</p>}

        {hasQuiz && (
          <div role="tablist" aria-label="Lesson sections" className="mt-6 inline-flex rounded-full border border-border bg-card p-1">
            {(["lesson", "quiz"] as const).map((k) => (
              <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn("min-h-10 rounded-full px-5 text-sm font-semibold capitalize", tab === k ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
                {k === "lesson" ? "Lesson" : "Quiz"}
              </button>
            ))}
          </div>
        )}

        {tab === "lesson" ? (
          <div className="mt-6 space-y-6">
            <div className="h-44 overflow-hidden rounded-2xl border border-border"><ContentImage src={lesson.image_url} motif={lesson.svg_motif ?? course.data.categories?.slug} alt="" /></div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm"><RichText text={lesson.body_richtext} /></div>
            {Array.isArray(lesson.key_points) && lesson.key_points.length > 0 && (
              <div className="rounded-2xl border border-accent bg-accent-soft p-6">
                <h2 className="flex items-center gap-2 text-lg"><Lightbulb className="size-5 text-warning" aria-hidden="true" />Remember</h2>
                <ul className="mt-3 space-y-2">
                  {lesson.key_points.map((k) => <li key={k} className="flex gap-2"><CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />{k}</li>)}
                </ul>
              </div>
            )}
            {lesson.try_it_action && (
              <div className="rounded-2xl bg-primary p-6 text-primary-foreground">
                <h2 className="flex items-center gap-2 text-lg"><Hand className="size-5 text-accent" aria-hidden="true" />Try it yourself</h2>
                <p className="mt-2">{lesson.try_it_action}</p>
              </div>
            )}
            {hasQuiz && <Button variant="outline" onClick={() => setTab("quiz")}>Go to the quiz</Button>}
          </div>
        ) : (
          <Quiz questions={quiz.data ?? []} onFinish={() => user && !isDone && complete.mutate()} />
        )}

        {!user && (
          <p className="mt-8 rounded-2xl border border-border bg-card p-4 text-sm">
            <Link to="/signup" className="font-semibold text-primary underline">Create a free account</Link> to save your progress and earn badges.
          </p>
        )}
      </main>

      <nav aria-label="Lesson navigation" className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background">
        <div className="container-page flex max-w-3xl items-center justify-between gap-2 py-3">
          {prev ? (
            <Button asChild variant="outline"><Link to="/learn/$courseSlug/$lessonSlug" params={{ courseSlug, lessonSlug: prev.slug }}><ArrowLeft />{t("lesson.prev", "Back")}</Link></Button>
          ) : <span />}
          <div className="flex gap-2">
            {user && !isDone && (
              <Button variant="ghost" onClick={() => complete.mutate()} disabled={complete.isPending}>{t("lesson.complete", "Mark as done")}</Button>
            )}
            <Button variant="accent" onClick={goNext}>{next ? t("lesson.next", "Next") : "Finish course"}<ArrowRight /></Button>
          </div>
        </div>
      </nav>
    </div>
  );
}

function Quiz({ questions, onFinish }: { questions: QuizQuestion[]; onFinish: () => void }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  if (questions.length === 0) return <p className="mt-6 text-muted-foreground">No quiz questions for this lesson yet.</p>;
  if (finished)
    return (
      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-2xl">You got {score} of {questions.length} right</h2>
        <p className="mt-2 text-muted-foreground">{score === questions.length ? "Well done! You know this well." : "Good effort. Read the lesson again and try once more."}</p>
        <Button className="mt-4" variant="outline" onClick={() => { setI(0); setPicked(null); setScore(0); setFinished(false); }}>Try again</Button>
      </div>
    );
  const q = questions[i]!;
  const answered = picked !== null;
  return (
    <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <p className="text-sm text-muted-foreground">Question {i + 1} of {questions.length}</p>
      <h2 className="mt-2 text-xl">{q.question}</h2>
      <div className="mt-4 grid gap-2" role="radiogroup" aria-label="Answers">
        {q.options.map((o, j) => {
          const correct = j === q.correct_index;
          return (
            <button
              key={j}
              role="radio"
              aria-checked={picked === j}
              disabled={answered}
              onClick={() => { setPicked(j); if (correct) setScore((s) => s + 1); }}
              className={cn(
                "flex min-h-12 items-center justify-between rounded-xl border px-4 py-3 text-left font-medium transition-colors",
                !answered && "border-border hover:border-primary",
                answered && correct && "border-success bg-primary-soft",
                answered && picked === j && !correct && "border-destructive",
                answered && picked !== j && !correct && "border-border opacity-60",
              )}
            >
              {o}
              {answered && correct && <CheckCircle2 className="size-5 text-success" aria-label="Correct answer" />}
              {answered && picked === j && !correct && <XCircle className="size-5 text-destructive" aria-label="Your answer, not correct" />}
            </button>
          );
        })}
      </div>
      {answered && (
        <div aria-live="polite" className="mt-4 rounded-xl bg-secondary p-4">
          <p className="font-semibold">{picked === q.correct_index ? "Correct!" : "Not quite."}</p>
          <p className="mt-1 text-sm">{q.explanation}</p>
          <Button className="mt-3" onClick={() => {
            if (i + 1 < questions.length) { setI(i + 1); setPicked(null); }
            else { setFinished(true); onFinish(); }
          }}>{i + 1 < questions.length ? "Next question" : "See my result"}</Button>
        </div>
      )}
    </div>
  );
}
