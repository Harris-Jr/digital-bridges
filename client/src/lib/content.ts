import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

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
export type Course = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category_id: string | null;
  icon_name: string;
  difficulty: "start_here" | "easy" | "intermediate";
  estimated_hours: number;
  outcomes: string[];
  image_url: string | null;
  is_published: boolean;
  sort_order: number;
  categories?: Category | null;
  lessons?: { id: string; is_published?: boolean }[];
};
export type Lesson = {
  id: string;
  course_id: string;
  slug: string;
  title: string;
  type: "read" | "quiz" | "practice";
  body_richtext: string;
  key_points: string[];
  try_it_action: string | null;
  svg_motif: string | null;
  image_url: string | null;
  sort_order: number;
  is_published: boolean;
};
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

export const useCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: () => apiGet<Category[]>("/categories", false),
  });

export const usePublishedCourses = () =>
  useQuery({
    queryKey: ["courses", "published"],
    queryFn: async () => {
      const rows = await apiGet<ApiCourse[]>("/courses", false);
      return rows.map(({ category, ...c }) => ({ ...c, categories: category }));
    },
  });

export const useCourse = (slug: string) =>
  useQuery({
    queryKey: ["course", slug],
    queryFn: async () => {
      const { category, ...c } = await apiGet<ApiCourse & { lessons: Lesson[] }>(`/courses/${slug}`, false);
      return { ...c, categories: category } as Omit<Course, "lessons"> & { lessons: Lesson[] };
    },
    retry: (count, err) => !(err instanceof Error && err.message.toLowerCase().includes("not found")) && count < 1,
  });

export const useQuiz = (lessonId: string | undefined) =>
  useQuery({
    queryKey: ["quiz", lessonId],
    enabled: !!lessonId,
    queryFn: () => apiGet<QuizQuestion[]>(`/lessons/${lessonId}/quiz`, false),
  });

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
