import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { Field } from "@/components/admin";

type Category = { id: string; name: string };
type Pathway = { id: string; title: string };

/** Course form fields, shared by the course list (create) and the builder (details). */
export function useCourseFields(): Field[] {
  const categories = useQuery({ queryKey: ["admin", "categories"], queryFn: () => apiGet<Category[]>("/admin/categories") });
  const pathways = useQuery({ queryKey: ["admin", "pathways"], queryFn: () => apiGet<Pathway[]>("/admin/pathways") });
  return [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "slug", label: "Slug (URL)", type: "text", required: true, help: "Lowercase words with dashes, e.g. staying-safe-online" },
    { name: "tagline", label: "Tagline", type: "text", help: "One short line shown on the course card." },
    { name: "description", label: "Description", type: "textarea", help: "Two or three plain sentences: who it is for and what they will be able to do." },
    { name: "pathway_id", label: "Pathway", type: "select", options: (pathways.data ?? []).map((p) => ({ value: p.id, label: p.title })) },
    { name: "category_id", label: "Category", type: "select", options: (categories.data ?? []).map((c) => ({ value: c.id, label: c.name })) },
    { name: "difficulty", label: "Level", type: "select", options: [
      { value: "start_here", label: "Start here" }, { value: "easy", label: "Easy" }, { value: "intermediate", label: "Intermediate" },
    ] },
    { name: "estimated_hours", label: "Estimated hours", type: "number" },
    { name: "pass_mark", label: "Quiz pass mark (%)", type: "number", help: "70 is a good default for beginners." },
    { name: "outcomes", label: "Learning outcomes", type: "lines", help: "One per line. Start each with a verb: Send money safely, Spot a fake message." },
    { name: "icon_name", label: "Icon name (lucide)", type: "text" },
    { name: "image_url", label: "Course image", type: "image", help: "Shown on the course card and header." },
    { name: "sort_order", label: "Sort order", type: "number" },
    { name: "is_published", label: "Published", type: "boolean" },
  ];
}

export function slugify(s: string): string {
  return s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 80) || "lesson";
}

/** Beginner guideline for lesson length (words of body text). */
export function lengthAdvice(words: number, type: string): { tone: "ok" | "warn" | "bad"; label: string } {
  if (type === "quiz") return { tone: "ok", label: "" };
  if (words === 0) return { tone: "bad", label: "Empty" };
  if (words < 100) return { tone: "warn", label: "Short" };
  if (words <= 300) return { tone: "ok", label: "Good length" };
  if (words <= 400) return { tone: "warn", label: "A bit long" };
  return { tone: "bad", label: "Too long, split it" };
}
