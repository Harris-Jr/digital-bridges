import { createFileRoute } from "@tanstack/react-router";
import { CrudManager, type Column, type Field } from "@/components/admin";

export const Route = createFileRoute("/admin/lessons/$lessonId/scenario")({
  component: Scenario,
});

type Step = {
  id: string; prompt: string; options: string[]; feedback: string[]; best_index: number; sort_order: number;
};

function Scenario() {
  const { lessonId } = Route.useParams();

  const fields: Field[] = [
    { name: "prompt", label: "Situation", type: "textarea", help: "Describe the situation the learner is in." },
    { name: "options", label: "Choices", type: "lines", help: "One choice per line (at least two)." },
    { name: "feedback", label: "Feedback per choice", type: "lines", help: "One line of feedback per choice, in the same order." },
    { name: "best_index", label: "Most advisable choice (0 = first line)", type: "number" },
    { name: "sort_order", label: "Step order", type: "number" },
  ];

  const columns: Column<Step>[] = [
    { label: "Situation", render: (s) => <span className="font-medium">{s.prompt}</span> },
    { label: "Choices", render: (s) => <span className="text-muted-foreground">{s.options.length}</span> },
    { label: "Best", render: (s) => <span className="text-muted-foreground">{s.options[s.best_index] ?? `#${s.best_index}`}</span> },
  ];

  return (
    <CrudManager<Step>
      resource="scenario-steps"
      title="Scenario steps"
      description="Build an interactive scenario: each step is a situation with choices and feedback."
      columns={columns}
      fields={fields}
      filter={{ key: "lesson_id", value: lessonId }}
      backLink={{ to: "/admin/courses", label: "Back to courses" }}
      defaults={{ best_index: 0, sort_order: 0, options: [], feedback: [] }}
    />
  );
}
