import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, CheckCircle2, Lightbulb, Hand, X, XCircle, Volume2, Compass, ThumbsUp, Play } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ContentImage, EmptyState, ErrorNote, RichText } from "@/components/site";
import { useCourse, useMyProgress, useQuiz, useScenario, type QuizQuestion, type ScenarioStep } from "@/lib/content";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { apiPost } from "@/lib/api";
import { queueProgress } from "@/lib/offline";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/learn/$courseSlug/$lessonSlug")({
  head: () => ({
    meta: [
      { title: "Lesson, Civic Wise" },
      { name: "description", content: "A short Civic Wise lesson in simple language." },
      { property: "og:title", content: "Lesson, Civic Wise" },
      { property: "og:description", content: "A short Civic Wise lesson in simple language." },
    ],
  }),
  component: LessonPlayer,
});

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

  const quiz = useQuiz(lesson?.id);
  const scenario = useScenario(lesson?.id, lesson?.type === "scenario");

  const complete = useMutation({
    mutationFn: async () => {
      if (!user || !lesson) return { badges_earned: 0, certificate: null as null | { slug: string; title: string } };
      return apiPost<{ ok: boolean; badges_earned: number; certificate: null | { slug: string; title: string } }>("/me/progress", { lesson_id: lesson.id });
    },
    onMutate: async () => {
      if (!user || !lesson) return;
      qc.setQueryData(["progress", user.id], (old: { lesson_id: string; completed_at: string }[] | undefined) => [
        ...(old ?? []),
        { lesson_id: lesson.id, completed_at: new Date().toISOString() },
      ]);
    },
    onSuccess: (res) => {
      if (res.certificate) {
        toast.success(`Course complete! You earned a certificate for “${res.certificate.title}”.`, { duration: 6000 });
      } else {
        toast.success(res.badges_earned ? "Lesson done, you earned a new badge!" : "Lesson marked as done");
      }
      qc.invalidateQueries({ queryKey: ["progress"] });
      qc.invalidateQueries({ queryKey: ["my-badges"] });
      qc.invalidateQueries({ queryKey: ["certificates"] });
    },
    onError: () => {
      // Offline: keep the optimistic "done" state, queue it, and sync later.
      if (lesson && !navigator.onLine) {
        queueProgress(lesson.id);
        toast.success("Saved offline. This lesson will sync when you reconnect.");
        return;
      }
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
        {isDone && <p className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-success"><CheckCircle2 className="size-4" aria-hidden="true" />{t("lesson.done", "Done")}</p>}

        {hasQuiz && (
          <div role="tablist" aria-label="Lesson sections" className="mt-6 inline-flex rounded-full border border-border bg-card p-1">
            {(["lesson", "quiz"] as const).map((k) => (
              <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn("min-h-10 rounded-full px-5 text-sm font-semibold capitalize", tab === k ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
                {k === "lesson" ? t("lesson.tab", "Lesson") : t("lesson.quizTab", "Quiz")}
              </button>
            ))}
          </div>
        )}

        {tab === "lesson" ? (
          <div className="mt-6 space-y-6">
            {lesson.video_url ? (
              <LessonVideo url={lesson.video_url} />
            ) : (
              <div className="h-44 overflow-hidden rounded-2xl border border-border"><ContentImage src={lesson.image_url} motif={lesson.svg_motif ?? course.data.categories?.slug} alt="" /></div>
            )}
            {lesson.audio_url && (
              <div className="rounded-2xl border border-accent bg-accent-soft p-4">
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><Volume2 className="size-4 text-primary" aria-hidden="true" />{t("lesson.listen", "Listen to this lesson")}</p>
                <audio controls preload="none" src={lesson.audio_url} className="w-full">{t("lesson.noaudio", "Your browser cannot play audio.")}</audio>
              </div>
            )}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm"><RichText text={lesson.body_richtext} /></div>
            {lesson.type === "scenario" && (scenario.data?.length ?? 0) > 0 && (
              <Scenario steps={scenario.data ?? []} onFinish={() => user && !isDone && complete.mutate()} />
            )}
            {Array.isArray(lesson.key_points) && lesson.key_points.length > 0 && (
              <div className="rounded-2xl border border-accent bg-accent-soft p-6">
                <h2 className="flex items-center gap-2 text-lg"><Lightbulb className="size-5 text-warning" aria-hidden="true" />{t("lesson.remember", "Remember")}</h2>
                <ul className="mt-3 space-y-2">
                  {lesson.key_points.map((k) => <li key={k} className="flex gap-2"><CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />{k}</li>)}
                </ul>
              </div>
            )}
            {lesson.try_it_action && (
              <div className="rounded-2xl bg-primary p-6 text-primary-foreground">
                <h2 className="flex items-center gap-2 text-lg"><Hand className="size-5 text-accent" aria-hidden="true" />{t("lesson.tryit", "Try it yourself")}</h2>
                <p className="mt-2">{lesson.try_it_action}</p>
              </div>
            )}
            {hasQuiz && <Button variant="outline" onClick={() => setTab("quiz")}>{t("lesson.gotoquiz", "Go to the quiz")}</Button>}
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
            <Button variant="accent" onClick={goNext}>{next ? t("lesson.next", "Next") : t("lesson.finish", "Finish course")}<ArrowRight /></Button>
          </div>
        </div>
      </nav>
    </div>
  );
}

function Quiz({ questions, onFinish }: { questions: QuizQuestion[]; onFinish: () => void }) {
  const { t } = useI18n();
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  function restart() {
    setI(0);
    setAnswers([]);
    setPicked(null);
    setFinished(false);
  }

  if (questions.length === 0) return <p className="mt-6 text-muted-foreground">{t("quiz.none", "No quiz questions for this lesson yet.")}</p>;

  // End of quiz: score, then a full review of every question with the learner's
  // answer, the correct answer, and the explanation of what went wrong.
  if (finished) {
    const score = answers.reduce((n, a, k) => n + (a === questions[k]!.correct_index ? 1 : 0), 0);
    return (
      <div className="mt-6 space-y-4">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-2xl">{t("quiz.got", "You got")} {score} {t("course.of", "of")} {questions.length} {t("quiz.right", "right")}</h2>
          <p className="mt-2 text-muted-foreground">{score === questions.length ? t("quiz.perfect", "Well done! You know this well.") : t("quiz.tryagainMsg", "Good effort. Look at the answers below, then read the lesson again and try once more.")}</p>
          <Button className="mt-4" variant="outline" onClick={restart}>{t("quiz.tryagain", "Try again")}</Button>
        </div>

        <h3 className="px-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("quiz.review", "Review your answers")}</h3>
        {questions.map((q, k) => {
          const yours = answers[k];
          const right = yours === q.correct_index;
          return (
            <div key={q.id} className={cn("rounded-2xl border bg-card p-6 shadow-sm", right ? "border-success/40" : "border-destructive/40")}>
              <p className="text-sm text-muted-foreground">{t("quiz.question", "Question")} {k + 1}</p>
              <h4 className="mt-1 text-lg font-semibold">{q.question}</h4>
              <div className="mt-3 grid gap-2">
                {q.options.map((o, j) => {
                  const isCorrect = j === q.correct_index;
                  const isYours = j === yours;
                  return (
                    <div
                      key={j}
                      className={cn(
                        "flex min-h-11 items-center justify-between rounded-xl border px-4 py-2.5 text-left font-medium",
                        isCorrect && "border-success bg-primary-soft",
                        isYours && !isCorrect && "border-destructive",
                        !isCorrect && !isYours && "border-border opacity-60",
                      )}
                    >
                      <span>
                        {o}
                        {isYours && <span className="ml-2 text-xs font-normal text-muted-foreground">({t("quiz.youranswer", "your answer")})</span>}
                      </span>
                      {isCorrect && <CheckCircle2 className="size-5 shrink-0 text-success" aria-label="Correct answer" />}
                      {isYours && !isCorrect && <XCircle className="size-5 shrink-0 text-destructive" aria-label="Your answer, not correct" />}
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 rounded-xl bg-secondary p-4">
                <p className="font-semibold">{right ? t("quiz.correct", "Correct!") : t("quiz.wrong", "Not quite.")}</p>
                <p className="mt-1 text-sm">{q.explanation}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const q = questions[i]!;
  return (
    <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <p className="text-sm text-muted-foreground">{t("quiz.question", "Question")} {i + 1} {t("course.of", "of")} {questions.length}</p>
      <h2 className="mt-2 text-xl">{q.question}</h2>
      <div className="mt-4 grid gap-2" role="radiogroup" aria-label="Answers">
        {q.options.map((o, j) => (
          <button
            key={j}
            role="radio"
            aria-checked={picked === j}
            onClick={() => setPicked(j)}
            className={cn(
              "flex min-h-12 items-center rounded-xl border px-4 py-3 text-left font-medium transition-colors",
              picked === j ? "border-primary bg-primary-soft" : "border-border hover:border-primary",
            )}
          >
            {o}
          </button>
        ))}
      </div>
      <Button
        className="mt-4"
        disabled={picked === null}
        onClick={() => {
          const next = [...answers, picked!];
          setAnswers(next);
          if (i + 1 < questions.length) { setI(i + 1); setPicked(null); }
          else { setFinished(true); onFinish(); }
        }}
      >
        {i + 1 < questions.length ? t("quiz.nextq", "Next question") : t("quiz.result", "See my result")}
      </Button>
    </div>
  );
}

function Scenario({ steps, onFinish }: { steps: ScenarioStep[]; onFinish: () => void }) {
  const { t } = useI18n();
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  if (steps.length === 0) return null;

  if (done)
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary-soft p-6">
        <h2 className="flex items-center gap-2 text-xl"><ThumbsUp className="size-5 text-success" aria-hidden="true" />{t("scenario.doneTitle", "You worked through it")}</h2>
        <p className="mt-2 text-muted-foreground">{t("scenario.doneBody", "Well done. Every choice teaches something, try it again to explore the other options.")}</p>
        <Button className="mt-4" variant="outline" onClick={() => { setI(0); setPicked(null); setDone(false); }}>{t("scenario.startover", "Start over")}</Button>
      </div>
    );

  const step = steps[i]!;
  const answered = picked !== null;
  const best = answered && picked === step.best_index;
  return (
    <div className="rounded-2xl border border-accent bg-accent-soft p-6">
      <p className="flex items-center gap-2 text-sm font-semibold text-primary"><Compass className="size-4" aria-hidden="true" />{t("scenario.step", "Scenario · step")} {i + 1} {t("course.of", "of")} {steps.length}</p>
      <h2 className="mt-2 text-xl">{step.prompt}</h2>
      <div className="mt-4 grid gap-2" role="radiogroup" aria-label="What would you do?">
        {step.options.map((o, j) => (
          <button
            key={j}
            role="radio"
            aria-checked={picked === j}
            disabled={answered}
            onClick={() => setPicked(j)}
            className={cn(
              "flex min-h-12 items-center justify-between rounded-xl border bg-card px-4 py-3 text-left font-medium transition-colors",
              !answered && "border-border hover:border-primary",
              answered && j === step.best_index && "border-success bg-primary-soft",
              answered && picked === j && j !== step.best_index && "border-warning",
              answered && picked !== j && j !== step.best_index && "opacity-60",
            )}
          >
            {o}
            {answered && j === step.best_index && <CheckCircle2 className="size-5 shrink-0 text-success" aria-label="Most advisable" />}
          </button>
        ))}
      </div>
      {answered && (
        <div aria-live="polite" className="mt-4 rounded-xl bg-card p-4 shadow-sm">
          <p className="font-semibold">{best ? t("scenario.good", "Good choice.") : t("scenario.better", "That could work, but there is a better way.")}</p>
          <p className="mt-1 text-sm">{step.feedback[picked] ?? step.feedback[step.best_index] ?? ""}</p>
          <Button className="mt-3" onClick={() => {
            if (i + 1 < steps.length) { setI(i + 1); setPicked(null); }
            else { setDone(true); onFinish(); }
          }}>{i + 1 < steps.length ? t("scenario.next", "Next step") : t("scenario.finish", "Finish scenario")}</Button>
        </div>
      )}
    </div>
  );
}

/** Pull the 11-char video id out of common YouTube URL shapes. */
function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1]! : null;
}

/** Low-data video: shows a thumbnail + play button; the YouTube iframe is only
    loaded once the learner taps play. Keeps the page light until then. */
function LessonVideo({ url }: { url: string }) {
  const { t } = useI18n();
  const [playing, setPlaying] = useState(false);
  const id = youtubeId(url);
  if (!id) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-2xl border border-border bg-card p-4 text-sm font-semibold text-primary hover:underline">
        <Play className="size-4" aria-hidden="true" />{t("lesson.watch", "Watch the video")}
      </a>
    );
  }
  if (playing) {
    return (
      <div className="aspect-video overflow-hidden rounded-2xl border border-border bg-black">
        <iframe
          className="size-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={t("lesson.video", "Lesson video")}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={t("lesson.watch", "Watch the video")}
      className="group relative block aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black"
    >
      <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" className="size-full object-cover opacity-90 transition-opacity group-hover:opacity-100" />
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid size-16 place-items-center rounded-full bg-primary/90 text-primary-foreground shadow-lg transition-transform duration-200 group-hover:scale-105">
          <Play className="size-7 translate-x-0.5" fill="currentColor" aria-hidden="true" />
        </span>
      </span>
      <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-left text-xs font-semibold text-white">
        {t("lesson.watchData", "Tap to play (uses data)")}
      </span>
    </button>
  );
}
