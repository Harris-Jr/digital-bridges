import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import { CrudManager, PublishBadge, type Column, type Field } from "@/components/admin";

export const Route = createFileRoute("/admin/courses/$courseId/lessons")({
  component: Lessons,
});

type Lesson = {
  id: string; slug: string; title: string; type: string;
  is_published: boolean; sort_order: number;
};
type Course = { id: string; title: string };

function Lessons() {
  const { courseId } = Route.useParams();
  const course = useQuery({ queryKey: ["admin", "course", courseId], queryFn: () => apiGet<Course>(`/admin/courses/${courseId}`) });

  const fields: Field[] = [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "slug", label: "Slug", type: "text", required: true },
    { name: "type", label: "Type", type: "select", options: [
      { value: "read", label: "Read" }, { value: "quiz", label: "Quiz" }, { value: "practice", label: "Practice" },
    ] },
    { name: "body_richtext", label: "Lesson body", type: "textarea", help: "Plain text. Use ## for a sub-heading and **word** for bold." },
    { name: "key_points", label: "Key points (Remember)", type: "lines", help: "One point per line" },
    { name: "try_it_action", label: "Try it yourself", type: "text" },
    { name: "svg_motif", label: "Motif (phone, shield, radio, community, circle)", type: "text" },
    { name: "image_url", label: "Image URL", type: "text" },
    { name: "sort_order", label: "Sort order", type: "number" },
    { name: "is_published", label: "Published", type: "boolean" },
  ];

  const columns: Column<Lesson>[] = [
    { label: "Title", render: (l) => <span className="font-medium">{l.title}</span> },
    { label: "Type", render: (l) => <span className="capitalize text-muted-foreground">{l.type}</span> },
    { label: "Status", render: (l) => <PublishBadge published={l.is_published} /> },
    { label: "Quiz", render: (l) => (
      <Button asChild variant="outline" size="sm"><Link to="/admin/lessons/$lessonId/quiz" params={{ lessonId: l.id }}>Questions</Link></Button>
    ) },
  ];

  return (
    <CrudManager<Lesson>
      resource="lessons"
      title="Lessons"
      description={course.data ? `Lessons in “${course.data.title}”` : "Course lessons"}
      columns={columns}
      fields={fields}
      filter={{ key: "course_id", value: courseId }}
      backLink={{ to: "/admin/courses", label: "Back to courses" }}
      defaults={{ type: "read", is_published: true, sort_order: 0, key_points: [], body_richtext: "" }}
    />
  );
}
