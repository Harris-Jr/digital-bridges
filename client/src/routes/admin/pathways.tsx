import { createFileRoute } from "@tanstack/react-router";
import { CrudManager, PublishBadge, type Column, type Field } from "@/components/admin";

export const Route = createFileRoute("/admin/pathways")({
  component: Pathways,
});

type Pathway = { id: string; slug: string; title: string; subtitle: string; is_published: boolean };

function Pathways() {
  const fields: Field[] = [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "slug", label: "Slug (URL)", type: "text", required: true, help: "e.g. civic-education" },
    { name: "subtitle", label: "Subtitle", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "icon_name", label: "Icon name (lucide)", type: "text", help: "e.g. Smartphone, Landmark, Compass" },
    { name: "accent", label: "Card colour", type: "select", options: [
      { value: "primary", label: "Green" }, { value: "accent", label: "Gold" },
    ] },
    { name: "sort_order", label: "Sort order", type: "number" },
    { name: "is_published", label: "Published", type: "boolean" },
  ];
  const columns: Column<Pathway>[] = [
    { label: "Title", render: (p) => <span className="font-medium">{p.title}</span> },
    { label: "Subtitle", render: (p) => <span className="text-muted-foreground">{p.subtitle}</span> },
    { label: "Status", render: (p) => <PublishBadge published={p.is_published} /> },
  ];
  return (
    <CrudManager<Pathway>
      resource="pathways"
      title="Pathways"
      description="Top-level learning paths shown on the home page (e.g. Digital Skills, Civic Education)."
      columns={columns}
      fields={fields}
      defaults={{ accent: "primary", sort_order: 0, is_published: true, icon_name: "Compass" }}
    />
  );
}
