import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

// Append ?lang= for non-English so the API overlays translated content.
// English needs no param (base rows are the source of truth).
function langQs(lang: string, extra?: string): string {
  const parts: string[] = [];
  if (extra) parts.push(extra);
  if (lang && lang !== "en") parts.push(`lang=${encodeURIComponent(lang)}`);
  return parts.length ? `?${parts.join("&")}` : "";
}

export type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

export type SitePage = {
  slug: string;
  hero_title: string;
  hero_subline: string;
  // CMS content blocks: shape varies per page, consumed defensively in the UI.
  body: Record<string, any>;
  updated_at: string;
};

export const usePage = (slug: string) =>
  useQuery({
    queryKey: ["page", slug],
    queryFn: () => apiGet<SitePage | null>(`/pages/${slug}`, false),
  });

export const useSetting = <T,>(key: string) =>
  useQuery({
    queryKey: ["setting", key],
    queryFn: async () => (await apiGet<{ value: T | null }>(`/settings/${key}`, false)).value,
    staleTime: 60_000,
  });

export const usePolicyVersion = () => {
  const q = useSetting<string>("policy_version");
  return q.data ?? null;
};

export type Category = { id: string; slug: string; name: string; icon_name: string; sort_order: number };
export type Pathway = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  icon_name: string;
  accent: "primary" | "accent";
  sort_order: number;
  course_count?: number;
};
export type Course = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category_id: string | null;
  pathway_id: string | null;
  icon_name: string;
  difficulty: "start_here" | "easy" | "intermediate";
  estimated_hours: number;
  outcomes: string[];
  image_url: string | null;
  is_published: boolean;
  sort_order: number;
  categories?: Category | null;
  pathway?: { slug: string; title: string } | null;
  lessons?: { id: string; slug?: string; is_published?: boolean }[];
};

export const usePathways = () => {
  const { lang } = useI18n();
  return useQuery({ queryKey: ["pathways", lang], queryFn: () => apiGet<Pathway[]>(`/pathways${langQs(lang)}`, false) });
};
export type Lesson = {
  id: string;
  course_id: string;
  module_id?: string | null;
  est_minutes?: number;
  slug: string;
  title: string;
  type: "read" | "quiz" | "practice" | "scenario";
  body_richtext: string;
  key_points: string[];
  try_it_action: string | null;
  svg_motif: string | null;
  image_url: string | null;
  audio_url: string | null;
  video_url: string | null;
  sort_order: number;
  is_published: boolean;
};

export type Certificate = { id: string; course_slug: string; course_title: string; issued_at: string; is_public: boolean };

export type MyBadge = {
  id: string; slug: string; name: string; description: string; icon_name: string;
  earned: boolean; earned_at: string | null; share_id: string | null; is_public: boolean;
};

export const useMyBadges = (userId: string | undefined) =>
  useQuery({
    queryKey: ["my-badges", userId],
    enabled: !!userId,
    queryFn: () => apiGet<MyBadge[]>("/me/badges"),
  });

export const useMyCertificates = (userId: string | undefined) =>
  useQuery({
    queryKey: ["certificates", userId],
    enabled: !!userId,
    queryFn: () => apiGet<Certificate[]>("/me/certificates"),
  });
export type LearnerCohort = { id: string; name: string; location: string; facilitator: string };

export const useMyLearnerCohorts = (userId: string | undefined) =>
  useQuery({
    queryKey: ["my-cohorts", userId],
    enabled: !!userId,
    queryFn: () => apiGet<LearnerCohort[]>("/me/cohorts"),
  });

export type QuizQuestion = {
  id: string;
  lesson_id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  sort_order: number;
};

// The API returns the joined category under `category`; the UI expects `categories`.
type ApiCourse = Omit<Course, "categories"> & { category: Category | null };

export const useCategories = () => {
  const { lang } = useI18n();
  return useQuery({
    queryKey: ["categories", lang],
    queryFn: () => apiGet<Category[]>(`/categories${langQs(lang)}`, false),
  });
};

export const usePublishedCourses = (pathwaySlug?: string) => {
  const { lang } = useI18n();
  return useQuery({
    queryKey: ["courses", "published", pathwaySlug ?? "all", lang],
    queryFn: async () => {
      const qs = langQs(lang, pathwaySlug ? `pathway=${encodeURIComponent(pathwaySlug)}` : undefined);
      const rows = await apiGet<ApiCourse[]>(`/courses${qs}`, false);
      return rows.map(({ category, ...c }) => ({ ...c, categories: category }));
    },
  });
};

export const usePathway = (slug: string) => {
  const { lang } = useI18n();
  return useQuery({
    queryKey: ["pathway", slug, lang],
    queryFn: async () => {
      const { pathway, courses } = await apiGet<{ pathway: Pathway; courses: ApiCourse[] }>(`/pathways/${slug}${langQs(lang)}`, false);
      return { pathway, courses: courses.map(({ category, ...c }) => ({ ...c, categories: category })) };
    },
  });
};

export const useCourse = (slug: string) => {
  const { lang } = useI18n();
  return useQuery({
    queryKey: ["course", slug, lang],
    queryFn: async () => {
      const { category, ...c } = await apiGet<ApiCourse & { lessons: Lesson[]; modules?: CourseModule[] }>(`/courses/${slug}${langQs(lang)}`, false);
      return { ...c, modules: c.modules ?? [], categories: category } as Omit<Course, "lessons"> & { lessons: Lesson[]; modules: CourseModule[] };
    },
    retry: (count, err) => !(err instanceof Error && err.message.toLowerCase().includes("not found")) && count < 1,
  });
};

export const useQuiz = (lessonId: string | undefined) => {
  const { lang } = useI18n();
  return useQuery({
    queryKey: ["quiz", lessonId, lang],
    enabled: !!lessonId,
    queryFn: () => apiGet<QuizQuestion[]>(`/lessons/${lessonId}/quiz${langQs(lang)}`, false),
  });
};

export type ScenarioStep = {
  id: string;
  lesson_id: string;
  prompt: string;
  options: string[];
  feedback: string[];
  best_index: number;
  sort_order: number;
};

export const useScenario = (lessonId: string | undefined, enabled: boolean) => {
  const { lang } = useI18n();
  return useQuery({
    queryKey: ["scenario", lessonId, lang],
    enabled: !!lessonId && enabled,
    queryFn: () => apiGet<ScenarioStep[]>(`/lessons/${lessonId}/scenario${langQs(lang)}`, false),
  });
};

export const useMyProgress = (userId: string | undefined) =>
  useQuery({
    queryKey: ["progress", userId],
    enabled: !!userId,
    queryFn: () => apiGet<{ lesson_id: string; completed_at: string }[]>("/me/progress"),
  });

export const usePublished = <T,>(table: "testimonials" | "partners" | "faqs" | "stats") =>
  useQuery({
    queryKey: [table, "public"],
    queryFn: () => apiGet<T[]>(`/published/${table}`, false),
  });

export const difficultyLabel: Record<string, string> = {
  start_here: "Start here",
  easy: "Easy",
  intermediate: "Intermediate",
};

/** Compute day streak from completion dates. */
export function computeStreak(dates: string[]) {
  const days = new Set(dates.map((d) => new Date(d).toISOString().slice(0, 10)));
  let streak = 0;
  const cur = new Date();
  if (!days.has(cur.toISOString().slice(0, 10))) cur.setDate(cur.getDate() - 1);
  while (days.has(cur.toISOString().slice(0, 10))) {
    streak++;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}

/** Percentage of a course's published lessons the learner has finished. */
export function coursePct(c: Course, done: Set<string>): number {
  const n = c.lessons?.length ?? 0;
  return n ? Math.round(((c.lessons?.filter((l) => done.has(l.id)).length ?? 0) / n) * 100) : 0;
}

/** "Continue where you left off": the unfinished course the learner touched most
    recently, and the first lesson in it they have not done. Falls back to the
    first course they have not started. */
export function pickContinue<C extends Course>(courses: C[], progress: { lesson_id: string; completed_at: string }[]) {
  const done = new Set(progress.map((p) => p.lesson_id));
  const lastTouched = new Map<string, number>();
  for (const p of progress) {
    const c = courses.find((x) => x.lessons?.some((l) => l.id === p.lesson_id));
    if (!c) continue;
    const ts = new Date(p.completed_at).getTime();
    if (ts > (lastTouched.get(c.id) ?? 0)) lastTouched.set(c.id, ts);
  }
  const inProgress = courses
    .filter((c) => { const pct = coursePct(c, done); return pct > 0 && pct < 100; })
    .sort((a, b) => (lastTouched.get(b.id) ?? 0) - (lastTouched.get(a.id) ?? 0));
  const course = inProgress[0] ?? courses.find((c) => coursePct(c, done) === 0);
  if (!course) return null;
  const nextLesson = course.lessons?.find((l) => !done.has(l.id));
  return { course, started: !!inProgress[0], pct: coursePct(course, done), lessonSlug: nextLesson?.slug ?? null };
}

export type CourseModule = { id: string; title: string; summary: string; sort_order: number };

/** Group a course's lessons under its modules, in order. Lessons without a known
    module go into a trailing untitled group. With no modules, one group. */
export function groupByModule<L extends { module_id?: string | null }>(modules: CourseModule[], lessons: L[]) {
  const groups = modules.map((m) => ({ module: m as CourseModule | null, lessons: lessons.filter((l) => l.module_id === m.id) })).filter((g) => g.lessons.length);
  const rest = lessons.filter((l) => !modules.some((m) => m.id === l.module_id));
  if (rest.length) groups.push({ module: null, lessons: rest });
  return groups;
}
