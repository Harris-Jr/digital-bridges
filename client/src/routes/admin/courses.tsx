import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import { CrudManager, PublishBadge, type Column, type Field } from "@/components/admin";

export const Route = createFileRoute("/admin/courses")({
  component: Courses,
});

type Course = {
  id: string; slug: string; title: string; difficulty: string;
  is_published: boolean; sort_order: number;
};
type Category = { id: string; name: string };

function Courses() {
  const categories = useQuery({ queryKey: ["admin", "categories"], queryFn: () => apiGet<Category[]>("/admin/categories") });

  const fields: Field[] = [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "slug", label: "Slug (URL)", type: "text", required: true, help: "Lowercase words with dashes, e.g. staying-safe-online" },
    { name: "tagline", label: "Tagline", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "category_id", label: "Category", type: "select", options: (categories.data ?? []).map((c) => ({ value: c.id, label: c.name })) },
    { name: "difficulty", label: "Difficulty", type: "select", options: [
      { value: "start_here", label: "Start here" }, { value: "easy", label: "Easy" }, { value: "intermediate", label: "Intermediate" },
    ] },
    { name: "estimated_hours", label: "Estimated hours", type: "number" },
    { name: "outcomes", label: "Learning outcomes", type: "lines", help: "One outcome per line" },
    { name: "icon_name", label: "Icon name (lucide)", type: "text" },
    { name: "image_url", label: "Course image", type: "image", help: "Shown on the course card and header." },
    { name: "sort_order", label: "Sort order", type: "number" },
    { name: "is_published", label: "Published", type: "boolean" },
  ];

  const columns: Column<Course>[] = [
    { label: "Title", render: (c) => <span className="font-medium">{c.title}</span> },
    { label: "Difficulty", render: (c) => <span className="capitalize text-muted-foreground">{c.difficulty.replace("_", " ")}</span> },
    { label: "Status", render: (c) => <PublishBadge published={c.is_published} /> },
    { label: "Lessons", render: (c) => (
      <Button asChild variant="outline" size="sm"><Link to="/admin/courses/$courseId/lessons" params={{ courseId: c.id }}>Manage lessons</Link></Button>
    ) },
  ];

  return (
    <CrudManager<Course>
      resource="courses"
      title="Courses"
      description="Create and edit courses. Learners only see published courses."
      columns={columns}
      fields={fields}
      defaults={{ difficulty: "easy", estimated_hours: 1, is_published: false, sort_order: 0, icon_name: "BookOpen", outcomes: [] }}
    />
  );
}
