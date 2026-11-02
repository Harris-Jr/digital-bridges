import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Blocks } from "lucide-react";
import { useCourseFields } from "@/lib/admin-course";
import { Button } from "@/components/ui/button";
import { CrudManager, PublishBadge, type Column } from "@/components/admin";

export const Route = createFileRoute("/admin/courses/")({
  component: Courses,
});

type Course = {
  id: string; slug: string; title: string; difficulty: string;
  is_published: boolean; sort_order: number;
};

function Courses() {
  const fields = useCourseFields();
  const navigate = useNavigate();

  const columns: Column<Course>[] = [
    { label: "Title", render: (c) => <span className="font-medium">{c.title}</span> },
    { label: "Difficulty", render: (c) => <span className="capitalize text-muted-foreground">{c.difficulty.replace("_", " ")}</span> },
    { label: "Status", render: (c) => <PublishBadge published={c.is_published} /> },
    { label: "Content", render: (c) => (
      <Button asChild variant="outline" size="sm"><Link to="/admin/courses/$courseId" params={{ courseId: c.id }}><Blocks className="size-4" />Open builder</Link></Button>
    ) },
  ];

  return (
    <CrudManager<Course>
      resource="courses"
      title="Courses"
      description="Create a course, then open its builder to add modules, lessons and quizzes. Learners only see published courses."
      columns={columns}
      fields={fields}
      onCreated={(c) => navigate({ to: "/admin/courses/$courseId", params: { courseId: c.id } })}
      defaults={{ difficulty: "easy", estimated_hours: 1, is_published: false, sort_order: 0, icon_name: "BookOpen", outcomes: [] }}
    />
  );
}
