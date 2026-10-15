import { createFileRoute } from "@tanstack/react-router";
import { CrudManager, PublishBadge, type Column, type Field } from "@/components/admin";

export const Route = createFileRoute("/admin/partners")({
  component: Partners,
});

type Partner = { id: string; name: string; category: string; is_published: boolean };

const CATEGORIES = [
  { value: "school", label: "School" },
  { value: "radio", label: "Community radio" },
  { value: "cs", label: "Civil society" },
  { value: "ict_hub", label: "ICT hub" },
  { value: "gov", label: "Government" },
  { value: "telecom", label: "Telecom" },
];

function Partners() {
  const fields: Field[] = [
    { name: "name", label: "Partner name", type: "text" },
    { name: "category", label: "Category", type: "select", options: CATEGORIES },
    { name: "is_published", label: "Published", type: "boolean" },
  ];
  const columns: Column<Partner>[] = [
    { label: "Name", render: (p) => <span className="font-medium">{p.name}</span> },
    { label: "Category", render: (p) => <span className="text-muted-foreground">{CATEGORIES.find((c) => c.value === p.category)?.label ?? p.category}</span> },
    { label: "Status", render: (p) => <PublishBadge published={p.is_published} /> },
  ];
  return (
    <CrudManager<Partner>
      resource="partners"
      title="Partners"
      description="Organisations shown in the “Working with” section."
      columns={columns}
      fields={fields}
      defaults={{ category: "cs", is_published: false }}
    />
  );
}
