import { createFileRoute } from "@tanstack/react-router";
import { CrudManager, PublishBadge, type Column, type Field } from "@/components/admin";

export const Route = createFileRoute("/admin/testimonials")({
  component: Testimonials,
});

type Testimonial = { id: string; quote: string; name: string; role_location: string; is_published: boolean };

function Testimonials() {
  const fields: Field[] = [
    { name: "quote", label: "Quote", type: "textarea" },
    { name: "name", label: "Name", type: "text" },
    { name: "role_location", label: "Role & location", type: "text", placeholder: "Marketeer, Chipata" },
    { name: "is_published", label: "Published", type: "boolean" },
  ];
  const columns: Column<Testimonial>[] = [
    { label: "Quote", render: (t) => <span className="line-clamp-1 max-w-md">{t.quote}</span> },
    { label: "Name", render: (t) => <span className="font-medium">{t.name}</span> },
    { label: "Status", render: (t) => <PublishBadge published={t.is_published} /> },
  ];
  return (
    <CrudManager<Testimonial>
      resource="testimonials"
      title="Testimonials"
      description="Learner and facilitator quotes shown on the home page."
      columns={columns}
      fields={fields}
      defaults={{ is_published: false, role_location: "" }}
    />
  );
}
