import { createFileRoute } from "@tanstack/react-router";
import { CrudManager, PublishBadge, type Column, type Field } from "@/components/admin";

export const Route = createFileRoute("/admin/faqs")({
  component: Faqs,
});

type Faq = { id: string; question: string; answer: string; sort_order: number; is_published: boolean };

function Faqs() {
  const fields: Field[] = [
    { name: "question", label: "Question", type: "text" },
    { name: "answer", label: "Answer", type: "textarea" },
    { name: "sort_order", label: "Sort order", type: "number" },
    { name: "is_published", label: "Published", type: "boolean" },
  ];
  const columns: Column<Faq>[] = [
    { label: "Question", render: (f) => <span className="font-medium">{f.question}</span> },
    { label: "Status", render: (f) => <PublishBadge published={f.is_published} /> },
  ];
  return (
    <CrudManager<Faq>
      resource="faqs"
      title="FAQs"
      description="Frequently asked questions."
      columns={columns}
      fields={fields}
      defaults={{ sort_order: 0, is_published: false }}
    />
  );
}
