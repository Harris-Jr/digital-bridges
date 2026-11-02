import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard, BookOpen, FileText, MessageSquareQuote, Handshake, HelpCircle,
  Plus, Pencil, Trash2, ChevronDown, ArrowLeft, Loader2, LogOut, Menu, X, PanelLeftClose, PanelLeftOpen, Eye, EyeOff, Sparkles, Route as RouteIcon, CalendarCheck, Languages, Image as ImageIcon, Users, FolderOpen, FileText as FileIcon, Newspaper, ImagePlay,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/auth";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useCollapsed } from "@/components/app-shell";

/* ------------------------------------------------------------------ shell */

type AdminPath = "/admin/media" | "/admin/news" | "/admin" | "/admin/pathways" | "/admin/courses" | "/admin/pages" | "/admin/testimonials" | "/admin/partners" | "/admin/faqs" | "/admin/workshops" | "/admin/translations" | "/admin/branding" | "/admin/materials" | "/admin/cohorts";
type NavItem = { to: AdminPath; label: string; icon: typeof LayoutDashboard; exact?: boolean };
type NavGroup = { id: string; label: string; items: NavItem[] };

// Grouped like a hosting control panel: a few labelled sections that can be
// folded away, so the menu stays short as features grow.
const NAV: NavGroup[] = [
  { id: "top", label: "", items: [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }] },
  { id: "learning", label: "Learning", items: [
    { to: "/admin/pathways", label: "Pathways", icon: RouteIcon },
    { to: "/admin/courses", label: "Courses", icon: BookOpen },
    { to: "/admin/translations", label: "Translations", icon: Languages },
  ] },
  { id: "people", label: "People", items: [
    { to: "/admin/cohorts", label: "Cohorts", icon: Users },
    { to: "/admin/workshops", label: "Workshops", icon: CalendarCheck },
    { to: "/admin/materials", label: "Trainer materials", icon: FolderOpen },
  ] },
  { id: "website", label: "Website", items: [
    { to: "/admin/pages", label: "Site pages", icon: FileText },
    { to: "/admin/news", label: "News", icon: Newspaper },
    { to: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
    { to: "/admin/partners", label: "Partners", icon: Handshake },
    { to: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  ] },
  { id: "files", label: "Files and brand", items: [
    { to: "/admin/media", label: "Media library", icon: ImagePlay },
    { to: "/admin/branding", label: "Logo", icon: ImageIcon },
  ] },
];

/** Which menu groups are folded. Remembered per browser. */
function useFoldedGroups(): [Set<string>, (id: string) => void] {
  const KEY = "cw_admin_nav_folded";
  const [folded, setFolded] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[]); } catch { return new Set(); }
  });
  const toggle = (id: string) => setFolded((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    try { localStorage.setItem(KEY, JSON.stringify([...next])); } catch { /* private mode */ }
    return next;
  });
  return [folded, toggle];
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { loading, isStaff } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [collapsed, toggle] = useCollapsed("cw_admin_sidebar_collapsed");
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !isStaff) navigate({ to: "/dashboard", replace: true });
  }, [loading, isStaff, navigate]);
  useEffect(() => { setOpen(false); }, [path]);

  if (loading || !isStaff) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-muted/30 lg:grid lg:transition-[grid-template-columns] lg:duration-200", collapsed ? "lg:grid-cols-[72px_1fr]" : "lg:grid-cols-[240px_1fr]")}>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-border bg-card lg:flex">
        <AdminNav path={path} collapsed={collapsed} onToggle={toggle} />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/95 px-4 py-3 backdrop-blur lg:hidden">
        <span className="font-display text-lg font-extrabold"><span className="text-primary">Civic Wise</span> Admin</span>
        <button onClick={() => setOpen(true)} aria-label="Open admin menu" aria-expanded={open} className="grid size-10 place-items-center rounded-full hover:bg-secondary">
          <Menu className="size-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-card shadow-xl">
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full hover:bg-secondary">
              <X className="size-5" />
            </button>
            <AdminNav path={path} />
          </div>
        </div>
      )}

      <main className="min-w-0 p-4 md:p-8">{children}</main>
    </div>
  );
}

function AdminNav({ path, collapsed = false, onToggle }: { path: string; collapsed?: boolean; onToggle?: () => void }) {
  const { signOut } = useAuth();
  const [folded, toggleGroup] = useFoldedGroups();
  const item = "flex min-h-10 items-center rounded-lg text-sm font-semibold transition-colors";
  return (
    <div className={cn("flex h-full flex-col gap-1 overflow-y-auto", collapsed ? "items-center p-2" : "p-3")}>
      <div className={cn("mb-3 flex items-center", collapsed ? "flex-col gap-2 pt-1" : "justify-between px-2 py-1")}>
        <Link to="/admin" className="font-display text-lg font-extrabold">
          {collapsed ? <span className="text-primary">CW</span> : <><span className="text-primary">Civic Wise</span> Admin</>}
        </Link>
        {onToggle && (
          <button onClick={onToggle} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground">
            {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
          </button>
        )}
      </div>
      <nav className={cn("flex flex-col", collapsed && "w-full")}>
        {NAV.map((g, gi) => {
          const isFolded = !collapsed && g.label !== "" && folded.has(g.id) && !g.items.some((n) => path.startsWith(n.to));
          return (
            <div key={g.id} className={cn(gi > 0 && (collapsed ? "mt-2 border-t border-border pt-2" : "mt-3"))}>
              {g.label && !collapsed && (
                <button onClick={() => toggleGroup(g.id)} aria-expanded={!isFolded}
                  className="flex w-full items-center justify-between rounded-md px-3 pb-1 pt-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 hover:text-foreground">
                  {g.label}
                  <ChevronDown className={cn("size-3.5 transition-transform", isFolded && "-rotate-90")} aria-hidden="true" />
                </button>
              )}
              {!isFolded && (
                <div className="flex flex-col gap-0.5">
                  {g.items.map((n) => {
                    const active = n.exact ? path === n.to : path.startsWith(n.to);
                    return (
                      <Link
                        key={n.to}
                        to={n.to}
                        title={collapsed ? n.label : undefined}
                        aria-label={collapsed ? n.label : undefined}
                        aria-current={active ? "page" : undefined}
                        className={cn(item, collapsed ? "justify-center" : "gap-2.5 px-3",
                          active ? "bg-primary-soft text-primary" : "text-foreground/75 hover:bg-secondary hover:text-foreground")}
                      >
                        <n.icon className="size-4 shrink-0" aria-hidden="true" />
                        {!collapsed && n.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className={cn("mt-auto flex flex-col gap-1 border-t border-border pt-3", collapsed && "w-full")}>
        <Link to="/dashboard" title={collapsed ? "Back to site" : undefined} className={cn(item, "text-foreground/80 hover:bg-secondary", collapsed ? "justify-center" : "gap-2 px-3")}>
          <ArrowLeft className="size-4 shrink-0" />{!collapsed && "Back to site"}
        </Link>
        <button onClick={() => void signOut()} title={collapsed ? "Sign out" : undefined} className={cn(item, "text-muted-foreground hover:bg-secondary", collapsed ? "justify-center" : "gap-2 px-3")}>
          <LogOut className="size-4 shrink-0" />{!collapsed && "Sign out"}
        </button>
      </div>
    </div>
  );
}

export function AdminHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-extrabold md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------- crud engine */

export type Field =
  | { name: string; label: string; type: "text" | "textarea" | "number"; required?: boolean; placeholder?: string; help?: string }
  | { name: string; label: string; type: "boolean" }
  | { name: string; label: string; type: "select"; options: { value: string; label: string }[] }
  | { name: string; label: string; type: "lines"; help?: string }
  | { name: string; label: string; type: "json"; help?: string }
  | { name: string; label: string; type: "image"; help?: string }
  | { name: string; label: string; type: "audio"; help?: string }
  | { name: string; label: string; type: "file"; help?: string };

export type Column<T> = { label: string; render: (row: T) => ReactNode; className?: string };

type Row = Record<string, unknown> & { id?: string; slug?: string };

export function toForm(fields: Field[], row: Record<string, unknown>): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (const f of fields) {
    const v = row[f.name];
    if (f.type === "boolean") out[f.name] = Boolean(v);
    else if (f.type === "lines") out[f.name] = Array.isArray(v) ? (v as string[]).join("\n") : "";
    else if (f.type === "json") out[f.name] = v ? JSON.stringify(v, null, 2) : "";
    else if (f.type === "number") out[f.name] = v === null || v === undefined ? "" : String(v);
    else out[f.name] = v === null || v === undefined ? "" : String(v);
  }
  return out;
}

export function toPayload(fields: Field[], form: Record<string, string | boolean>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const v = form[f.name];
    if (f.type === "boolean") out[f.name] = Boolean(v);
    else if (f.type === "number") out[f.name] = v === "" ? 0 : Number(v);
    else if (f.type === "lines") out[f.name] = String(v).split("\n").map((s) => s.trim()).filter(Boolean);
    else if (f.type === "json") out[f.name] = v ? JSON.parse(String(v)) : {};
    else out[f.name] = v;
  }
  return out;
}

export function CrudManager<T extends Row>({
  resource, title, description, columns, fields, defaults, idKey = "id", filter, backLink, canCreate = true, canDelete = true, headerExtra, onCreated,
}: {
  onCreated?: (row: T) => void;
  resource: string;
  title: string;
  description?: string;
  columns: Column<T>[];
  fields: Field[];
  defaults: Record<string, unknown>;
  idKey?: "id" | "slug";
  filter?: { key: string; value: string };
  backLink?: { to: string; label: string };
  canCreate?: boolean;
  canDelete?: boolean;
  headerExtra?: ReactNode;
}) {
  const qc = useQueryClient();
  const qs = filter ? `?${filter.key}=${encodeURIComponent(filter.value)}` : "";
  const key = ["admin", resource, filter?.value ?? "all"];

  const list = useQuery({ queryKey: key, queryFn: () => apiGet<T[]>(`/admin/${resource}${qs}`) });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [confirmDel, setConfirmDel] = useState<T | null>(null);

  const openCreate = () => { setEditing(null); setForm(toForm(fields, { ...defaults, ...(filter ? { [filter.key]: filter.value } : {}) })); setOpen(true); };
  const openEdit = (row: T) => { setEditing(row); setForm(toForm(fields, row)); setOpen(true); };

  const save = useMutation({
    mutationFn: async () => {
      let payload: Record<string, unknown>;
      try {
        payload = toPayload(fields, form);
      } catch {
        throw new Error("One of the JSON fields is not valid JSON.");
      }
      if (filter) payload[filter.key] = filter.value;
      if (editing) return apiPatch(`/admin/${resource}/${editing[idKey]}`, payload);
      return apiPost(`/admin/${resource}`, payload);
    },
    onSuccess: (row) => {
      toast.success(editing ? "Saved" : "Created");
      setOpen(false);
      qc.invalidateQueries({ queryKey: key });
      if (!editing && onCreated && row) onCreated(row as T);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save. Check the fields."),
  });

  const del = useMutation({
    mutationFn: (row: T) => apiDelete(`/admin/${resource}/${row[idKey]}`),
    onSuccess: () => { toast.success("Deleted"); setConfirmDel(null); qc.invalidateQueries({ queryKey: key }); },
    onError: () => toast.error("Could not delete."),
  });

  return (
    <>
      <AdminHeader
        title={title}
        description={description}
        action={
          <div className="flex items-center gap-2">
            {headerExtra}
            {canCreate && <Button onClick={openCreate}><Plus className="size-4" />New</Button>}
          </div>
        }
      />
      {backLink && <Button asChild variant="ghost" size="sm" className="mb-4"><Link to={backLink.to}><ArrowLeft className="size-4" />{backLink.label}</Link></Button>}

      {/* Mobile: one card per row so every field and action stays reachable. */}
      <div className="space-y-3 md:hidden">
        {list.isLoading ? (
          <div className="py-10 text-center text-muted-foreground"><Loader2 className="mx-auto size-5 animate-spin" /></div>
        ) : (list.data?.length ?? 0) === 0 ? (
          <p className="rounded-xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">Nothing here yet. Tap “New” to add the first one.</p>
        ) : (
          list.data!.map((row) => (
            <div key={String(row[idKey])} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 text-[15px]">{columns[0]?.render(row)}</div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => openEdit(row)}><Pencil className="size-4" /></Button>
                  {canDelete && <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => setConfirmDel(row)}><Trash2 className="size-4 text-destructive" /></Button>}
                </div>
              </div>
              {columns.length > 1 && (
                <dl className="mt-3 grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 text-sm">
                  {columns.slice(1).map((c, i) => (
                    <div key={i} className="contents">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{c.label}</dt>
                      <dd className="min-w-0">{c.render(row)}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          ))
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {columns.map((c, i) => <th key={i} className={cn("px-4 py-3 font-semibold", c.className)}>{c.label}</th>)}
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {list.isLoading ? (
              <tr><td colSpan={columns.length + 1} className="px-4 py-10 text-center text-muted-foreground"><Loader2 className="mx-auto size-5 animate-spin" /></td></tr>
            ) : (list.data?.length ?? 0) === 0 ? (
              <tr><td colSpan={columns.length + 1} className="px-4 py-10 text-center text-muted-foreground">Nothing here yet. Click “New” to add the first one.</td></tr>
            ) : (
              list.data!.map((row) => (
                <tr key={String(row[idKey])} className="hover:bg-muted/30">
                  {columns.map((c, i) => <td key={i} className={cn("px-4 py-3 align-middle", c.className)}>{c.render(row)}</td>)}
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => openEdit(row)}><Pencil className="size-4" /></Button>
                      {canDelete && <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => setConfirmDel(row)}><Trash2 className="size-4 text-destructive" /></Button>}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? `Edit ${title.replace(/s$/, "")}` : `New ${title.replace(/s$/, "")}`}</DialogTitle></DialogHeader>
          <form
            id="crud-form"
            onSubmit={(e) => { e.preventDefault(); save.mutate(); }}
            className="space-y-4"
          >
            {fields.map((f) => <FieldInput key={f.name} field={f} value={form[f.name]} onChange={(v) => setForm((s) => ({ ...s, [f.name]: v }))} />)}
          </form>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" form="crud-form" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => confirmDel && del.mutate(confirmDel)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function FieldInput({ field, value, onChange }: { field: Field; value: string | boolean | undefined; onChange: (v: string | boolean) => void }) {
  if (field.type === "boolean") {
    return (
      <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
        <Label htmlFor={field.name}>{field.label}</Label>
        <Switch id={field.name} checked={Boolean(value)} onCheckedChange={onChange} />
      </div>
    );
  }
  if (field.type === "image" || field.type === "audio" || field.type === "file") {
    return (
      <div>
        <Label>{field.label}</Label>
        <div className="mt-1"><MediaUpload value={String(value ?? "")} onChange={(v) => onChange(v)} kind={field.type} /></div>
        {field.help && <p className="mt-1 text-xs text-muted-foreground">{field.help}</p>}
      </div>
    );
  }
  return (
    <div>
      <Label htmlFor={field.name}>{field.label}</Label>
      {field.type === "textarea" || field.type === "lines" || field.type === "json" ? (
        <Textarea id={field.name} rows={field.type === "textarea" ? 6 : 4} className="mt-1 font-mono text-sm" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
      ) : field.type === "select" ? (
        <select id={field.name} className="mt-1 h-11 w-full rounded-md border border-input bg-background px-3 text-sm" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
          <option value="">, </option>
          {field.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <Input id={field.name} type={field.type === "number" ? "number" : "text"} className="mt-1 h-11" placeholder={field.type !== "number" ? field.placeholder : undefined} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
      )}
      {"help" in field && field.help && <p className="mt-1 text-xs text-muted-foreground">{field.help}</p>}
    </div>
  );
}

/* ------------------------------------------------------------ media upload */

type MediaConfig = { enabled: boolean; cloudName: string | null };
type SignResponse = { cloudName: string; apiKey: string; folder: string; timestamp: number; signature: string };

export type MediaItem = { id: string; url: string; public_id: string | null; kind: "image" | "video" | "audio" | "file"; name: string; alt: string; bytes: number | null; width: number | null; height: number | null; created_at: string };

type CloudinaryResult = { secure_url: string; public_id: string; bytes?: number; width?: number; height?: number; original_filename?: string; format?: string };

async function uploadToCloudinary(file: File, resourceType: "image" | "video" | "raw"): Promise<CloudinaryResult> {
  const sign = await apiPost<SignResponse>("/admin/media/sign");
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sign.apiKey);
  form.append("timestamp", String(sign.timestamp));
  form.append("folder", sign.folder);
  form.append("signature", sign.signature);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/${resourceType}/upload`, { method: "POST", body: form });
  const data = (await res.json()) as Partial<CloudinaryResult> & { error?: { message?: string } };
  if (!res.ok || !data.secure_url) throw new Error(data.error?.message ?? "Upload failed. Please try again.");
  return data as CloudinaryResult;
}

const kindOf = (file: File): MediaItem["kind"] =>
  file.type.startsWith("image/") ? "image" : file.type.startsWith("audio/") ? "audio" : file.type.startsWith("video/") ? "video" : "file";

/** Upload a file to Cloudinary and record it in the media library. Returns the library item. */
export async function uploadToLibrary(file: File): Promise<MediaItem> {
  const kind = kindOf(file);
  const r = await uploadToCloudinary(file, kind === "image" ? "image" : kind === "file" ? "raw" : "video");
  return apiPost<MediaItem>("/admin/media/items", {
    url: r.secure_url, public_id: r.public_id, kind,
    name: file.name.replace(/\.[^.]+$/, ""), bytes: r.bytes ?? file.size, width: r.width ?? null, height: r.height ?? null,
  });
}

/** Pick an existing file from the media library. */
export function MediaPicker({ open, onOpenChange, kind, onPick }: { open: boolean; onOpenChange: (o: boolean) => void; kind: MediaItem["kind"]; onPick: (item: MediaItem) => void }) {
  const [q, setQ] = useState("");
  const list = useQuery({ queryKey: ["admin", "media", kind, q], enabled: open, queryFn: () => apiGet<MediaItem[]>(`/admin/media/items?kind=${kind}&q=${encodeURIComponent(q)}`) });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader><DialogTitle>Choose from the media library</DialogTitle></DialogHeader>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or description" className="h-11" />
        {list.isLoading ? (
          <div className="py-10 text-center"><Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" /></div>
        ) : (list.data?.length ?? 0) === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Nothing here yet. Upload files in Admin, Media library.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {list.data!.map((m) => (
              <button key={m.id} type="button" onClick={() => { onPick(m); onOpenChange(false); }}
                className="group overflow-hidden rounded-xl border border-border bg-card text-left transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                {m.kind === "image"
                  ? <img src={m.url} alt={m.alt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                  : <div className="grid aspect-[4/3] w-full place-items-center bg-secondary"><FileIcon className="size-8 text-primary" /></div>}
                <p className="truncate px-2 py-1.5 text-xs font-medium">{m.name || m.url.split("/").pop()}</p>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function MediaUpload({ value, onChange, kind = "image" }: { value: string; onChange: (v: string) => void; kind?: "image" | "audio" | "file" }) {
  const cfg = useQuery({ queryKey: ["media-config"], queryFn: () => apiGet<MediaConfig>("/admin/media/config"), staleTime: 5 * 60_000 });
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const noun = kind === "audio" ? "audio" : kind === "file" ? "file" : "image";
  const accept = kind === "audio" ? "audio/*" : kind === "file" ? ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" : "image/*";
  // Cloudinary: audio is a "video" resource; documents are "raw" so PDFs download
  // as files (no image-delivery restrictions).
  const [picking, setPicking] = useState(false);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (kind === "file" && file.size > 20 * 1024 * 1024) { toast.error("That file is larger than 20 MB. Please make it smaller."); return; }
    setBusy(true);
    try {
      onChange((await uploadToLibrary(file)).url);
      toast.success(`${noun[0]!.toUpperCase()}${noun.slice(1)} uploaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {value && (kind === "audio"
        ? <audio controls src={value} className="w-full" />
        : kind === "file"
          ? <a href={value} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-primary underline-offset-2 hover:underline"><FileIcon className="size-4 shrink-0" /><span className="truncate">{decodeURIComponent(value.split("/").pop() ?? value)}</span></a>
          : <img src={value} alt="" className="h-28 w-full rounded-lg border border-border object-cover" />)}
      <div className="flex flex-wrap gap-2">
        {cfg.data?.enabled && (
          <>
            <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={onFile} />
            <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={busy}>
              {busy ? "Uploading…" : value ? `Replace ${noun}` : `Upload ${noun}`}
            </Button>
          </>
        )}
        <Button type="button" variant="outline" size="sm" onClick={() => setPicking(true)}>Choose from library</Button>
        {value && <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>Remove</Button>}
      </div>
      <MediaPicker open={picking} onOpenChange={setPicking} kind={kind === "audio" ? "audio" : kind === "file" ? "file" : "image"} onPick={(m) => onChange(m.url)} />
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={kind === "file" ? "https://… or /materials/guide.pdf" : `https://… ${noun} URL`} className="h-11" />
      {cfg.data && !cfg.data.enabled && (
        <p className="text-xs text-muted-foreground">Uploads aren't set up yet, paste a {noun} link above. (Add Cloudinary keys to the server .env to enable uploads.)</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------- AI quiz generator */

type AiDraft = { question: string; options: string[]; correct_index: number; explanation: string };

export function AiQuizGenerator({ lessonId }: { lessonId: string }) {
  const qc = useQueryClient();
  const cfg = useQuery({ queryKey: ["ai-admin-config"], queryFn: () => apiGet<{ enabled: boolean }>("/admin/ai/config"), staleTime: 5 * 60_000 });
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(4);
  const [drafts, setDrafts] = useState<AiDraft[] | null>(null);
  const [sel, setSel] = useState<Set<number>>(new Set());

  const gen = useMutation({
    mutationFn: () => apiPost<AiDraft[]>("/admin/ai/quiz-from-lesson", { lesson_id: lessonId, count }),
    onSuccess: (d) => { setDrafts(d); setSel(new Set(d.map((_, i) => i))); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not generate questions."),
  });

  const save = useMutation({
    mutationFn: async () => {
      const chosen = (drafts ?? []).filter((_, i) => sel.has(i));
      for (const q of chosen) {
        await apiPost("/admin/quiz-questions", { lesson_id: lessonId, question: q.question, options: q.options, correct_index: q.correct_index, explanation: q.explanation });
      }
      return chosen.length;
    },
    onSuccess: (n) => { toast.success(`${n} question${n === 1 ? "" : "s"} added`); setOpen(false); setDrafts(null); qc.invalidateQueries({ queryKey: ["admin", "quiz-questions", lessonId] }); },
    onError: () => toast.error("Could not save the questions."),
  });

  if (cfg.data && !cfg.data.enabled) {
    return (
      <Button type="button" variant="outline" disabled title="AI is off. Add GEMINI_API_KEY or GROQ_API_KEY to server/.env and restart the API.">
        <Sparkles className="size-4" />Generate with AI (off)
      </Button>
    );
  }
  if (!cfg.data) return null;
  const toggle = (i: number) => setSel((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });

  return (
    <>
      <Button type="button" variant="outline" onClick={() => { setOpen(true); setDrafts(null); gen.mutate(); }}>
        <Sparkles className="size-4" />Generate with AI
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>AI quiz draft</DialogTitle></DialogHeader>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Questions:</span>
            <select value={count} onChange={(e) => setCount(Number(e.target.value))} className="h-9 rounded-md border border-input bg-background px-2">
              {[3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <Button type="button" variant="ghost" size="sm" onClick={() => gen.mutate()} disabled={gen.isPending}>Regenerate</Button>
          </div>
          {gen.isPending ? (
            <div className="py-10 text-center text-muted-foreground"><Loader2 className="mx-auto size-6 animate-spin" /><p className="mt-2 text-sm">Writing questions from the lesson…</p></div>
          ) : drafts && drafts.length > 0 ? (
            <div className="space-y-3">
              {drafts.map((q, i) => (
                <div key={i} className="rounded-xl border border-border p-4">
                  <label className="flex items-start gap-2">
                    <input type="checkbox" checked={sel.has(i)} onChange={() => toggle(i)} className="mt-1 size-4 accent-[var(--primary)]" />
                    <span className="font-medium">{q.question}</span>
                  </label>
                  <ul className="mt-2 space-y-1 pl-6 text-sm">
                    {q.options.map((o, j) => <li key={j} className={j === q.correct_index ? "font-semibold text-success" : "text-muted-foreground"}>{j === q.correct_index ? "✓ " : "• "}{o}</li>)}
                  </ul>
                  {q.explanation && <p className="mt-2 pl-6 text-xs text-muted-foreground">{q.explanation}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">No questions generated. Try again.</p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="button" onClick={() => save.mutate()} disabled={save.isPending || !drafts || sel.size === 0}>
              {save.isPending ? "Adding…" : `Add ${sel.size} selected`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* --------------------------------------------------------- small helpers */

export function PublishBadge({ published }: { published: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold", published ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>
      {published ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
      {published ? "Published" : "Draft"}
    </span>
  );
}

export { useQuery as useAdminQuery };
