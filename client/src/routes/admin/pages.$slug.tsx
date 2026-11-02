import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Children, cloneElement, isValidElement, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown, ArrowLeft, ArrowUp, ChevronDown, Copy, ExternalLink, Eye, EyeOff, Loader2, Monitor, PenLine, Plus, Save, Trash2, X,
} from "lucide-react";
import { toast } from "sonner";
import { MediaUpload } from "@/components/admin";
import { BLOCKS, Blocks, PageHero, type Block, type BlockField } from "@/components/blocks";
import { Icon, ICON_NAMES } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { apiDelete, apiGet, apiPatch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { pageName, pagePath, type AdminPage } from "./pages.index";

export const Route = createFileRoute("/admin/pages/$slug")({ component: PageBuilderRoute });

/* Pages whose content is a list of policy sections rather than blocks. */
const POLICY = new Set(["privacy", "terms", "accessibility"]);
const SITE_LINKS = ["/signup", "/signin", "/courses", "/about", "/for-trainers", "/news", "/contact", "/dashboard"];

type Data = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

function PageBuilderRoute() {
  const { slug } = Route.useParams();
  const q = useQuery({ queryKey: ["admin", "page", slug], queryFn: () => apiGet<AdminPage>(`/admin/site-pages/${slug}`) });
  if (q.isLoading) return <div className="grid place-items-center py-24"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  if (!q.data) return <p className="py-24 text-center text-muted-foreground">Page not found.</p>;
  return <PageBuilder key={q.data.slug + q.data.updated_at} page={q.data} />;
}

const newId = () => `b-${Math.random().toString(36).slice(2, 9)}`;

/** Set a field and drop its interface translation key: once edited, the text is the editor's own. */
function setField(data: Data, key: string, value: unknown): Data {
  const next: Data = { ...data, [key]: value };
  if (data.t && key in data.t) {
    const t = { ...data.t };
    delete t[key];
    if (Object.keys(t).length) next.t = t; else delete next.t;
  }
  return next;
}

function PageBuilder({ page }: { page: AdminPage }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const policy = POLICY.has(page.slug);
  const [hero, setHero] = useState({
    hero_eyebrow: page.hero_eyebrow ?? "", hero_title: page.hero_title ?? "", hero_subline: page.hero_subline ?? "",
    hero_image_url: page.hero_image_url ?? "", nav_label: page.nav_label ?? "", is_published: page.is_published,
  });
  const [blocks, setBlocks] = useState<Block[]>(page.blocks ?? []);
  const [sections, setSections] = useState<{ heading: string; body: string }[]>(Array.isArray(page.body?.sections) ? page.body.sections : []);
  const [selected, setSelected] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [adding, setAdding] = useState<number | null>(null);
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const touch = () => setDirty(true);
  const setH = <K extends keyof typeof hero>(k: K, v: (typeof hero)[K]) => { setHero((s) => ({ ...s, [k]: v })); touch(); };
  const updateBlock = (id: string, fn: (b: Block) => Block) => { setBlocks((bs) => bs.map((b) => (b.id === id ? fn(b) : b))); touch(); };
  const move = (i: number, dir: -1 | 1) => {
    setBlocks((bs) => { const j = i + dir; if (j < 0 || j >= bs.length) return bs; const n = [...bs]; [n[i], n[j]] = [n[j]!, n[i]!]; return n; });
    touch();
  };
  const remove = (i: number) => {
    const removed = blocks[i]!;
    setBlocks((bs) => bs.filter((_, k) => k !== i));
    touch();
    toast(`Removed "${BLOCKS[removed.type]?.label ?? removed.type}"`, {
      action: { label: "Undo", onClick: () => setBlocks((bs) => [...bs.slice(0, i), removed, ...bs.slice(i)]) },
    });
  };
  const duplicate = (i: number) => {
    const copy: Block = { ...structuredClone(blocks[i]!), id: newId() };
    setBlocks((bs) => [...bs.slice(0, i + 1), copy, ...bs.slice(i + 1)]);
    setSelected(copy.id);
    touch();
  };
  const add = (type: string, at: number) => {
    const b: Block = { id: newId(), type, data: structuredClone(BLOCKS[type]!.defaults) as Data };
    setBlocks((bs) => [...bs.slice(0, at), b, ...bs.slice(at)]);
    setSelected(b.id);
    setAdding(null);
    touch();
  };

  const save = useMutation({
    mutationFn: () => apiPatch(`/admin/site-pages/${page.slug}`, {
      hero_eyebrow: hero.hero_eyebrow.trim(), hero_title: hero.hero_title.trim(), hero_subline: hero.hero_subline.trim(),
      hero_image_url: hero.hero_image_url.trim() || null, nav_label: hero.nav_label.trim(), is_published: hero.is_published,
      blocks,
      ...(policy ? { body: { ...page.body, sections: sections.filter((s) => s.heading.trim() || s.body.trim()) } } : {}),
    }),
    onSuccess: () => {
      toast.success(hero.is_published ? "Saved. The page is live." : "Saved. The page is hidden from visitors.");
      setDirty(false);
      qc.invalidateQueries({ queryKey: ["admin", "pages"] });
      qc.invalidateQueries({ queryKey: ["page", page.slug] });
      qc.invalidateQueries({ queryKey: ["pages", "custom"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save."),
  });
  const del = useMutation({
    mutationFn: () => apiDelete(`/admin/site-pages/${page.slug}`),
    onSuccess: () => { toast.success("Page deleted"); setDirty(false); qc.invalidateQueries({ queryKey: ["admin", "pages"] }); qc.invalidateQueries({ queryKey: ["pages", "custom"] }); navigate({ to: "/admin/pages" }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not delete."),
  });

  const path = pagePath(page.slug, page.is_system);
  const previewPage = { ...hero, blocks };

  return (
    <div>
      {/* Top bar */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Link to="/admin/pages" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Site pages</Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="font-display text-xl font-extrabold">{pageName(page)}</h1>
        <a href={path} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">{path}<ExternalLink className="size-3.5" /></a>
        <div className="ml-auto flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-border bg-card p-0.5 xl:hidden">
            <button onClick={() => setView("edit")} className={cn("inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold", view === "edit" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}><PenLine className="size-4" />Edit</button>
            <button onClick={() => setView("preview")} className={cn("inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold", view === "preview" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}><Monitor className="size-4" />Preview</button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,30rem)_minmax(0,1fr)]">
        {/* ------------------------------------------------ editor column */}
        <div className={cn("space-y-4", view === "preview" && "hidden xl:block")}>
          <Panel title="Page settings">
            <div className="flex items-center justify-between gap-4 rounded-lg bg-secondary/60 px-3 py-2.5">
              <div><p className="text-sm font-semibold">Published</p><p className="text-xs text-muted-foreground">{hero.is_published ? "Visitors can see this page." : "Only admins can see this page."}</p></div>
              <Switch checked={hero.is_published} onCheckedChange={(v) => setH("is_published", v)} aria-label="Published" />
            </div>
            {!page.is_system && (
              <F label="Show in the site menu as" help="Leave empty to keep it out of the menu. Keep it to one or two words.">
                <Input value={hero.nav_label} onChange={(e) => setH("nav_label", e.target.value)} placeholder="For example: Programmes" className="h-11" />
              </F>
            )}
          </Panel>

          <Panel title="Top of the page" subtitle="The big heading area visitors see first.">
            <F label="Small heading"><Input value={hero.hero_eyebrow} onChange={(e) => setH("hero_eyebrow", e.target.value)} placeholder="Optional" className="h-11" /></F>
            <F label="Title" help={page.slug === "home" ? "Press Enter to start a new line." : undefined}>
              {page.slug === "home"
                ? <Textarea rows={3} value={hero.hero_title} onChange={(e) => setH("hero_title", e.target.value)} />
                : <Input value={hero.hero_title} onChange={(e) => setH("hero_title", e.target.value)} className="h-11" />}
            </F>
            <F label="Intro"><Textarea rows={3} value={hero.hero_subline} onChange={(e) => setH("hero_subline", e.target.value)} /></F>
            {!policy && (
              <F label="Photo" help="Leave empty to show the brand illustration.">
                <MediaUpload value={hero.hero_image_url} onChange={(v) => setH("hero_image_url", v)} kind="image" />
              </F>
            )}
          </Panel>

          {policy ? (
            <Panel title="Sections" subtitle="Each section is a heading and a paragraph.">
              <ItemsEditor
                items={sections}
                itemLabel="section"
                fields={[{ key: "heading", label: "Heading", kind: "text" }, { key: "body", label: "Text", kind: "textarea" }]}
                onChange={(v) => { setSections(v as typeof sections); touch(); }}
              />
            </Panel>
          ) : (
            <section>
              <div className="mb-2 flex items-end justify-between">
                <div><h2 className="font-semibold">Sections</h2><p className="text-sm text-muted-foreground">Shown in this order below the top of the page.</p></div>
              </div>
              <ol className="space-y-2">
                {blocks.length === 0 && <li className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">No sections yet.</li>}
                {blocks.map((b, i) => (
                  <BlockRow
                    key={b.id} block={b} index={i} count={blocks.length} open={selected === b.id}
                    onToggle={() => setSelected(selected === b.id ? null : b.id)}
                    onMove={(d) => move(i, d)} onRemove={() => remove(i)} onDuplicate={() => duplicate(i)}
                    onHide={() => updateBlock(b.id, (x) => ({ ...x, hidden: !x.hidden }))}
                    onChange={(data) => updateBlock(b.id, (x) => ({ ...x, data }))}
                    onAddAfter={() => setAdding(i + 1)}
                  />
                ))}
              </ol>
              <Button variant="outline" className="mt-3 w-full border-dashed" onClick={() => setAdding(blocks.length)}><Plus className="size-4" />Add a section</Button>
            </section>
          )}

          {!page.is_system && (
            <Panel title="Delete page">
              <p className="text-sm text-muted-foreground">Removes the page and its address. This cannot be undone.</p>
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setConfirmDelete(true)}><Trash2 className="size-4" />Delete this page</Button>
            </Panel>
          )}
        </div>

        {/* ----------------------------------------------- preview column */}
        <div className={cn(view === "edit" && "hidden xl:block")}>
          <div className="sticky top-4">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><Monitor className="size-3.5" />Preview{!policy && ", click a section to edit it"}</p>
            <ScaledPreview>
              {policy ? (
                <div className="container-page max-w-3xl py-12">
                  <h1 className="text-4xl text-primary">{hero.hero_title || pageName(page)}</h1>
                  {hero.hero_subline && <p className="mt-3 text-lg text-muted-foreground">{hero.hero_subline}</p>}
                  <div className="mt-8 space-y-6">{sections.map((s, i) => <section key={i}><h2 className="text-2xl">{s.heading}</h2><p className="mt-2 text-foreground/90">{s.body}</p></section>)}</div>
                </div>
              ) : (
                <>
                  <PageHero eyebrow={previewPage.hero_eyebrow} title={previewPage.hero_title || pageName(page)} intro={previewPage.hero_subline} image={previewPage.hero_image_url} />
                  <PreviewBlocks blocks={blocks} selected={selected} onSelect={(id) => { setSelected(id); setView("edit"); requestAnimationFrame(() => document.getElementById(`edit-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })); }} />
                </>
              )}
            </ScaledPreview>
          </div>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 z-30 -mx-4 -mb-4 mt-6 border-t border-border bg-card/95 backdrop-blur md:-mx-8 md:-mb-8">
        <div className="flex items-center justify-end gap-3 px-4 py-3 md:px-8">
          <span className="mr-auto text-sm text-muted-foreground">{dirty ? "You have unsaved changes." : "All changes saved."}</span>
          <Button onClick={() => save.mutate()} disabled={!dirty || save.isPending}>
            {save.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}Save
          </Button>
        </div>
      </div>

      <AddBlockDialog open={adding !== null} onOpenChange={(o) => !o && setAdding(null)} onPick={(type) => add(type, adding ?? blocks.length)} />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{pageName(page)}"?</AlertDialogTitle>
            <AlertDialogDescription>The page at {path} will stop working. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => del.mutate()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ------------------------------------------------------------ pieces */

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-4 md:p-5">
      <div><h2 className="font-semibold">{title}</h2>{subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}</div>
      {children}
    </section>
  );
}

/* A labelled field. The label is tied to the first form control inside. */
function F({ label, help, children }: { label: string; help?: string; children: ReactNode }) {
  const id = useId();
  const kids = Children.toArray(children);
  const first = kids[0];
  const withId = isValidElement(first) && (typeof first.type === "object" || first.type === "select")
    ? [cloneElement(first as React.ReactElement<{ id?: string }>, { id }), ...kids.slice(1)]
    : kids;
  return (
    <div className="space-y-1.5">
      <Label className="text-sm" htmlFor={id}>{label}</Label>
      {withId}
      {help && <p className="text-xs text-muted-foreground">{help}</p>}
    </div>
  );
}

function blockSummary(b: Block): string {
  const d = b.data ?? {};
  const s = d.title || d.eyebrow || (typeof d.body === "string" ? d.body : "") || "";
  return String(s).replace(/[#*_\[\]()!]/g, "").slice(0, 70);
}

function BlockRow({ block, index, count, open, onToggle, onMove, onRemove, onDuplicate, onHide, onChange, onAddAfter }: {
  block: Block; index: number; count: number; open: boolean;
  onToggle: () => void; onMove: (d: -1 | 1) => void; onRemove: () => void; onDuplicate: () => void; onHide: () => void;
  onChange: (d: Data) => void; onAddAfter: () => void;
}) {
  const def = BLOCKS[block.type];
  const IconC = def?.icon;
  const iconBtn = "grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30";
  return (
    <li id={`edit-${block.id}`} className={cn("overflow-hidden rounded-2xl border bg-card transition-colors", open ? "border-primary shadow-sm" : "border-border", block.hidden && "opacity-70")}>
      <div className="flex items-center gap-2 p-2 pl-3">
        <button onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-3 py-1 text-left" aria-expanded={open}>
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">{IconC ? <IconC className="size-4" /> : "?"}</span>
          <span className="min-w-0">
            <span className="flex items-center gap-2 text-sm font-semibold">
              {def?.label ?? block.type}
              {block.hidden && <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">Hidden</span>}
            </span>
            <span className="block truncate text-xs text-muted-foreground">{blockSummary(block) || def?.description}</span>
          </span>
          <ChevronDown className={cn("ml-auto size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
        </button>
        <div className="flex shrink-0 items-center">
          <button className={iconBtn} onClick={() => onMove(-1)} disabled={index === 0} aria-label="Move up" title="Move up"><ArrowUp className="size-4" /></button>
          <button className={iconBtn} onClick={() => onMove(1)} disabled={index === count - 1} aria-label="Move down" title="Move down"><ArrowDown className="size-4" /></button>
          <button className={iconBtn} onClick={onHide} aria-label={block.hidden ? "Show section" : "Hide section"} title={block.hidden ? "Show" : "Hide"}>{block.hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
        </div>
      </div>
      {open && (
        <div className="space-y-4 border-t border-border p-4">
          {!def ? <p className="text-sm text-muted-foreground">This section type is not supported.</p>
            : def.fields.length === 0 ? <p className="rounded-lg bg-secondary/60 p-3 text-sm text-muted-foreground">{def.description} Nothing to set here: its content is managed in its own admin page.</p>
            : def.fields.map((f) => <FieldEditor key={f.key} field={f} value={block.data[f.key]} onChange={(v) => onChange(setField(block.data, f.key, v))} />)}
          <div className="flex flex-wrap gap-2 border-t border-border pt-3">
            <Button variant="outline" size="sm" onClick={onAddAfter}><Plus className="size-4" />Add section below</Button>
            <Button variant="outline" size="sm" onClick={onDuplicate}><Copy className="size-4" />Duplicate</Button>
            <Button variant="ghost" size="sm" className="ml-auto text-destructive hover:text-destructive" onClick={onRemove}><Trash2 className="size-4" />Remove</Button>
          </div>
        </div>
      )}
    </li>
  );
}

const selectCls = "h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

function FieldEditor({ field, value, onChange }: { field: BlockField; value: any; onChange: (v: unknown) => void }) { // eslint-disable-line @typescript-eslint/no-explicit-any
  switch (field.kind) {
    case "text":
      return <F label={field.label} help={field.help}><Input value={value ?? ""} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} className="h-11" /></F>;
    case "textarea":
      return <F label={field.label} help={field.help}><Textarea rows={3} value={value ?? ""} onChange={(e) => onChange(e.target.value)} /></F>;
    case "richtext":
      return (
        <F label={field.label} help="Leave a blank line between paragraphs. Start a line with ## for a heading or - for a list. **bold**, [link text](https://...).">
          <Textarea rows={7} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="font-mono text-sm" />
        </F>
      );
    case "image":
      return <F label={field.label} help={field.help}><MediaUpload value={value ?? ""} onChange={onChange} kind="image" /></F>;
    case "link":
      return (
        <F label={field.label} help="A page on this site such as /signup, or a full web address.">
          <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} list="site-links" placeholder="/signup or https://..." className="h-11" />
          <datalist id="site-links">{SITE_LINKS.map((l) => <option key={l} value={l} />)}</datalist>
        </F>
      );
    case "icon":
      return (
        <F label={field.label}>
          <div className="flex items-center gap-2">
            <span className="grid size-11 shrink-0 place-items-center rounded-lg border border-border bg-secondary"><Icon name={value} className="size-5 text-primary" /></span>
            <select name="icon" aria-label={field.label} className={selectCls} value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
              <option value="">Choose an icon</option>
              {ICON_NAMES.map((n) => <option key={n} value={n}>{n.replace(/([a-z])([A-Z0-9])/g, "$1 $2")}</option>)}
            </select>
          </div>
        </F>
      );
    case "number":
      return <F label={field.label}><Input type="number" min={field.min} max={field.max} value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))} className="h-11 w-32" /></F>;
    case "boolean":
      return <div className="flex items-center justify-between gap-4"><Label className="text-sm">{field.label}</Label><Switch checked={!!value} onCheckedChange={onChange} /></div>;
    case "select":
      return (
        <F label={field.label}>
          <select name={field.key} className={selectCls} value={value ?? field.options[0]?.value} onChange={(e) => onChange(e.target.value)}>
            {field.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </F>
      );
    case "items":
      return <F label={field.label}><ItemsEditor items={Array.isArray(value) ? value : []} fields={field.fields} itemLabel={field.itemLabel} max={field.max} onChange={onChange} /></F>;
  }
}

function ItemsEditor({ items, fields, itemLabel, max = 30, onChange }: { items: Data[]; fields: BlockField[]; itemLabel: string; max?: number; onChange: (v: Data[]) => void }) {
  const [open, setOpen] = useState<number | null>(items.length <= 1 ? 0 : null);
  const set = (i: number, d: Data) => onChange(items.map((x, k) => (k === i ? d : x)));
  const mv = (i: number, dir: -1 | 1) => { const j = i + dir; if (j < 0 || j >= items.length) return; const n = [...items]; [n[i], n[j]] = [n[j]!, n[i]!]; onChange(n); setOpen(j); };
  const title = (it: Data) => it.title || it.heading || it.alt || (it.url ? String(it.url).split("/").pop() : "") || `Untitled ${itemLabel}`;
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="rounded-xl border border-border bg-background">
          <div className="flex items-center gap-1 p-1.5 pl-3">
            <button className="flex min-w-0 flex-1 items-center gap-2 py-1 text-left text-sm" onClick={() => setOpen(open === i ? null : i)}>
              {it.icon && <Icon name={it.icon} className="size-4 shrink-0 text-primary" />}
              {it.url && fields.some((f) => f.kind === "image") && <img src={it.url} alt="" className="size-7 shrink-0 rounded object-cover" />}
              <span className="truncate font-medium">{title(it)}</span>
              <ChevronDown className={cn("ml-auto size-4 shrink-0 text-muted-foreground transition-transform", open === i && "rotate-180")} />
            </button>
            <button className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary disabled:opacity-30" disabled={i === 0} onClick={() => mv(i, -1)} aria-label={`Move ${itemLabel} up`}><ArrowUp className="size-4" /></button>
            <button className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary disabled:opacity-30" disabled={i === items.length - 1} onClick={() => mv(i, 1)} aria-label={`Move ${itemLabel} down`}><ArrowDown className="size-4" /></button>
            <button className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-destructive" onClick={() => { onChange(items.filter((_, k) => k !== i)); setOpen(null); }} aria-label={`Remove ${itemLabel}`}><X className="size-4" /></button>
          </div>
          {open === i && (
            <div className="space-y-3 border-t border-border p-3">
              {fields.map((f) => <FieldEditor key={f.key} field={f} value={it[f.key]} onChange={(v) => set(i, setField(it, f.key, v))} />)}
            </div>
          )}
        </div>
      ))}
      {items.length < max && (
        <Button type="button" variant="outline" size="sm" onClick={() => { onChange([...items, {}]); setOpen(items.length); }}><Plus className="size-4" />Add {itemLabel}</Button>
      )}
    </div>
  );
}

function AddBlockDialog({ open, onOpenChange, onPick }: { open: boolean; onOpenChange: (o: boolean) => void; onPick: (type: string) => void }) {
  const groups = ["Content", "Live sections"] as const;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>Add a section</DialogTitle></DialogHeader>
        {groups.map((g) => (
          <div key={g}>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{g === "Content" ? "Your content" : "Live sections (fill themselves from the database)"}</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {Object.entries(BLOCKS).filter(([, d]) => d.group === g).map(([type, d]) => (
                <button key={type} onClick={() => onPick(type)} className="flex items-start gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:border-primary hover:bg-primary-soft/30">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary"><d.icon className="size-4" /></span>
                  <span><span className="block text-sm font-semibold">{d.label}</span><span className="block text-xs text-muted-foreground">{d.description}</span></span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </DialogContent>
    </Dialog>
  );
}

/* Render the page at desktop width, scaled down to fit the preview column. */
function ScaledPreview({ children }: { children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [height, setHeight] = useState(600);
  const WIDTH = 1280;
  useLayoutEffect(() => {
    const o = outer.current, i = inner.current;
    if (!o || !i || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      const s = Math.min(1, o.clientWidth / WIDTH);
      setScale(s);
      setHeight(i.scrollHeight * s);
    });
    ro.observe(o); ro.observe(i);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={outer} className="max-h-[calc(100vh-7rem)] overflow-y-auto overflow-x-hidden rounded-2xl border border-border bg-background shadow-sm">
      <div style={{ height }}>
        <div ref={inner} style={{ width: WIDTH, transform: `scale(${scale})`, transformOrigin: "top left" }} className="pointer-events-auto bg-background">
          {children}
        </div>
      </div>
    </div>
  );
}

function PreviewBlocks({ blocks, selected, onSelect }: { blocks: Block[]; selected: string | null; onSelect: (id: string) => void }) {
  return (
    <>
      {blocks.filter((b) => !b.hidden).map((b) => (
        <div
          key={b.id}
          role="button"
          tabIndex={0}
          onClickCapture={(e) => { e.preventDefault(); e.stopPropagation(); onSelect(b.id); }}
          onKeyDown={(e) => { if (e.key === "Enter") onSelect(b.id); }}
          className={cn("relative cursor-pointer outline-offset-[-4px] hover:outline hover:outline-4 hover:outline-primary/40", selected === b.id && "outline outline-4 outline-primary")}
        >
          <Blocks blocks={[b]} />
        </div>
      ))}
    </>
  );
}
