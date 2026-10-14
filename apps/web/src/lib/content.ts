import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

export const usePage = (slug: string) =>
  useQuery({
    queryKey: ["page", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_pages").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data as null | { slug: string; hero_title: string; hero_subline: string; body: any; updated_at: string };
    },
  });

export const useSetting = <T,>(key: string) =>
  useQuery({
    queryKey: ["setting", key],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", key).maybeSingle();
      return (data?.value ?? null) as T | null;
    },
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

export const useCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data as Category[];
    },
  });

export const usePublishedCourses = () =>
  useQuery({
    queryKey: ["courses", "published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*, categories(*), lessons(id,is_published)")
        .eq("is_published", true)
        .order("sort_order");
      if (error) throw error;
      return (data as unknown as Course[]).map((c) => ({
        ...c,
        lessons: (c.lessons ?? []).filter((l) => l.is_published !== false),
      }));
    },
  });

export const useCourse = (slug: string) =>
  useQuery({
    queryKey: ["course", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*, categories(*), lessons(*)")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const raw = data as unknown as Omit<Course, "lessons"> & { lessons: Lesson[] };
      const c = { ...raw, lessons: (raw.lessons ?? []).filter((l) => l.is_published).sort((a, b) => a.sort_order - b.sort_order) };
      return c;
    },
  });

export const useMyProgress = (userId: string | undefined) =>
  useQuery({
    queryKey: ["progress", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("lesson_progress").select("lesson_id,completed_at");
      if (error) throw error;
      return data as { lesson_id: string; completed_at: string }[];
    },
  });

export const usePublished = <T,>(table: "testimonials" | "partners" | "faqs" | "stats") =>
  useQuery({
    queryKey: [table, "public"],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = supabase.from(table).select("*");
      if (table !== "stats") q = q.eq("is_published", true);
      if (table === "stats" || table === "faqs") q = q.order("sort_order");
      const { data, error } = await q;
      if (error) throw error;
      return data as T[];
    },
  });

export const difficultyLabel: Record<string, string> = {
  start_here: "Start here",
  easy: "Easy",
  intermediate: "Intermediate",
};

/** Upload to a private bucket and return a long-lived signed URL. */
export async function uploadToBucket(bucket: "media" | "resources", file: File) {
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
  const path = `${Date.now()}-${safe}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
  if (error) throw error;
  const { data, error: e2 } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (e2) throw e2;
  return { path, url: data.signedUrl };
}

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
