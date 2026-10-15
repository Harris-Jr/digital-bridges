import { createFileRoute } from "@tanstack/react-router";
import { CrudManager, type Column, type Field } from "@/components/admin";

export const Route = createFileRoute("/admin/lessons/$lessonId/quiz")({
  component: Quiz,
});

type Question = {
  id: string; question: string; options: string[]; correct_index: number; sort_order: number;
};

function Quiz() {
  const { lessonId } = Route.useParams();

  const fields: Field[] = [
    { name: "question", label: "Question", type: "textarea" },
    { name: "options", label: "Answer options", type: "lines", help: "One option per line (at least two)" },
    { name: "correct_index", label: "Correct option number (0 = first line)", type: "number" },
    { name: "explanation", label: "Explanation", type: "textarea" },
    { name: "sort_order", label: "Sort order", type: "number" },
  ];

  const columns: Column<Question>[] = [
    { label: "Question", render: (q) => <span className="font-medium">{q.question}</span> },
    { label: "Options", render: (q) => <span className="text-muted-foreground">{q.options.length}</span> },
    { label: "Correct", render: (q) => <span className="text-muted-foreground">{q.options[q.correct_index] ?? `#${q.correct_index}`}</span> },
  ];

  return (
    <CrudManager<Question>
      resource="quiz-questions"
      title="Quiz questions"
      description="Add multiple-choice questions for this lesson."
      columns={columns}
      fields={fields}
      filter={{ key: "lesson_id", value: lessonId }}
      backLink={{ to: "/admin/courses", label: "Back to courses" }}
      defaults={{ correct_index: 0, sort_order: 0, options: [], explanation: "" }}
    />
  );
}
