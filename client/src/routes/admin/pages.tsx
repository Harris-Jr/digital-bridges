import { createFileRoute } from "@tanstack/react-router";
import { CrudManager, PublishBadge, type Column, type Field } from "@/components/admin";

export const Route = createFileRoute("/admin/pages")({
  component: Pages,
});

type Page = { slug: string; hero_title: string; is_published: boolean };

function Pages() {
  const fields: Field[] = [
    { name: "hero_title", label: "Hero title", type: "text" },
    { name: "hero_subline", label: "Hero subline", type: "textarea" },
    { name: "body", label: "Body content (JSON)", type: "json", help: "Structured page content. Edit carefully — must be valid JSON." },
    { name: "is_published", label: "Published", type: "boolean" },
  ];

  const columns: Column<Page>[] = [
    { label: "Page", render: (p) => <span className="font-medium capitalize">{p.slug}</span> },
    { label: "Hero title", render: (p) => <span className="text-muted-foreground">{p.hero_title}</span> },
    { label: "Status", render: (p) => <PublishBadge published={p.is_published} /> },
  ];

  return (
    <CrudManager<Page>
      resource="site-pages"
      title="Site pages"
      description="Edit the content of the home, about, privacy and other standing pages."
      columns={columns}
      fields={fields}
      idKey="slug"
      canCreate={false}
      canDelete={false}
      defaults={{}}
    />
  );
}
