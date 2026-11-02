import { createFileRoute } from "@tanstack/react-router";
import { FileText, Link2, Presentation, Image as ImageIcon, Video } from "lucide-react";
import { CrudManager, PublishBadge, type Column, type Field } from "@/components/admin";

export const Route = createFileRoute("/admin/materials")({ component: Materials });

type Material = { id: string; title: string; description: string; type: string; audience: string; file_url: string; is_published: boolean };

const TYPES = [
  { value: "pdf", label: "PDF" },
  { value: "doc", label: "Document (Word)" },
  { value: "slides", label: "Slides" },
  { value: "image", label: "Poster / image" },
  { value: "video", label: "Video link" },
  { value: "link", label: "Web link" },
];
const icon = (t: string) => (t === "slides" ? Presentation : t === "image" ? ImageIcon : t === "video" ? Video : t === "link" ? Link2 : FileText);

function Materials() {
  const fields: Field[] = [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "description", label: "Short description", type: "textarea", help: "One or two sentences: what it is and when to use it." },
    { name: "type", label: "Type", type: "select", options: TYPES },
    { name: "file_url", label: "File", type: "file", help: "Upload a PDF (best for printing and phones), or paste a link. Max 20 MB." },
    { name: "audience", label: "Who can see it", type: "select", options: [{ value: "trainer", label: "Facilitators" }, { value: "learner", label: "Learners" }] },
    { name: "sort_order", label: "Sort order", type: "number" },
    { name: "is_published", label: "Published", type: "boolean" },
  ];
  const columns: Column<Material>[] = [
    { label: "Title", render: (m) => { const I = icon(m.type); return <span className="flex items-center gap-2 font-medium"><I className="size-4 shrink-0 text-primary" />{m.title}</span>; } },
    { label: "Type", render: (m) => <span className="text-muted-foreground">{TYPES.find((t) => t.value === m.type)?.label ?? m.type}</span> },
    { label: "For", render: (m) => <span className="text-muted-foreground">{m.audience === "learner" ? "Learners" : "Facilitators"}</span> },
    { label: "Status", render: (m) => <PublishBadge published={m.is_published} /> },
    { label: "Open", render: (m) => m.file_url ? <a href={m.file_url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary underline">View</a> : <span className="text-muted-foreground">-</span> },
  ];
  return (
    <CrudManager<Material>
      resource="resources"
      title="Materials"
      description="Guides, posters and slides facilitators download from the For Trainers area."
      columns={columns}
      fields={fields}
      defaults={{ type: "pdf", audience: "trainer", sort_order: 0, is_published: false, description: "", file_url: "" }}
    />
  );
}
