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
  lessons?: { id: string; is_published?: boolean }[];
};

export const usePathways = () => {
  const { lang } = useI18n();
  return useQuery({ queryKey: ["pathways", lang], queryFn: () => apiGet<Pathway[]>(`/pathways${langQs(lang)}`, false) });
};
export type Lesson = {
  id: string;
  course_id: string;
  slug: string;
  title: string;
  type: "read" | "quiz" | "practice" | "scenario";
  body_richtext: string;
  key_points: string[];
  try_it_action: string | null;
  svg_motif: string | null;
  image_url: string | null;
  audio_url: string | null;
  sort_order: number;
  is_published: boolean;
};

export type Certificate = { id: string; course_slug: string; course_title: string; issued_at: string };

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
      const { category, ...c } = await apiGet<ApiCourse & { lessons: Lesson[] }>(`/courses/${slug}${langQs(lang)}`, false);
      return { ...c, categories: category } as Omit<Course, "lessons"> & { lessons: Lesson[] };
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
