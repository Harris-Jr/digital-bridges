import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard, BookOpen, FileText, MessageSquareQuote, Handshake, HelpCircle,
  Plus, Pencil, Trash2, ArrowLeft, Loader2, LogOut, Eye, EyeOff, Sparkles, Route as RouteIcon,
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

/* ------------------------------------------------------------------ shell */

type AdminPath = "/admin" | "/admin/pathways" | "/admin/courses" | "/admin/pages" | "/admin/testimonials" | "/admin/partners" | "/admin/faqs";
type NavItem = { to: AdminPath; label: string; icon: typeof LayoutDashboard; exact?: boolean };

const NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/pathways", label: "Pathways", icon: RouteIcon },
  { to: "/admin/courses", label: "Courses", icon: BookOpen },
  { to: "/admin/pages", label: "Site pages", icon: FileText },
  { to: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { to: "/admin/partners", label: "Partners", icon: Handshake },
  { to: "/admin/faqs", label: "FAQs", icon: HelpCircle },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const { loading, isStaff, signOut } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !isStaff) navigate({ to: "/dashboard", replace: true });
  }, [loading, isStaff, navigate]);

  if (loading || !isStaff) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 md:grid md:grid-cols-[240px_1fr]">
      <aside className="sticky top-0 z-20 flex h-auto flex-col gap-1 border-b border-border bg-card p-3 md:h-screen md:border-b-0 md:border-r">
        <Link to="/" className="mb-3 flex items-center gap-2 px-2 py-1">
          <img src="/images/brand-icon.png" alt="" className="size-8" width={32} height={32} />
          <span className="font-display text-lg font-extrabold">Admin</span>
        </Link>
        <nav className="flex flex-row flex-wrap gap-1 md:flex-col">
          {NAV.map((n) => {
            const active = n.exact ? path === n.to : path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <n.icon className="size-4" aria-hidden="true" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto hidden flex-col gap-1 md:flex">
          <Button asChild variant="ghost" size="sm" className="justify-start"><Link to="/dashboard"><ArrowLeft className="size-4" />Back to site</Link></Button>
          <Button variant="ghost" size="sm" className="justify-start text-muted-foreground" onClick={() => void signOut().then(() => navigate({ to: "/" }))}><LogOut className="size-4" />Sign out</Button>
        </div>
      </aside>
      <main className="min-w-0 p-4 md:p-8">{children}</main>
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
  | { name: string; label: string; type: "audio"; help?: string };

export type Column<T> = { label: string; render: (row: T) => ReactNode; className?: string };

type Row = Record<string, unknown> & { id?: string; slug?: string };

function toForm(fields: Field[], row: Record<string, unknown>): Record<string, string | boolean> {
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

function toPayload(fields: Field[], form: Record<string, string | boolean>): Record<string, unknown> {
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
  resource, title, description, columns, fields, defaults, idKey = "id", filter, backLink, canCreate = true, canDelete = true, headerExtra,
}: {
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
    onSuccess: () => { toast.success(editing ? "Saved" : "Created"); setOpen(false); qc.invalidateQueries({ queryKey: key }); },
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

      <div className="overflow-hidden rounded-xl border border-border bg-card">
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

function FieldInput({ field, value, onChange }: { field: Field; value: string | boolean | undefined; onChange: (v: string | boolean) => void }) {
  if (field.type === "boolean") {
    return (
      <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
        <Label htmlFor={field.name}>{field.label}</Label>
        <Switch id={field.name} checked={Boolean(value)} onCheckedChange={onChange} />
      </div>
    );
  }
  if (field.type === "image" || field.type === "audio") {
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
          <option value="">—</option>
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

async function uploadToCloudinary(file: File, resourceType: "image" | "video"): Promise<string> {
  const sign = await apiPost<SignResponse>("/admin/media/sign");
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sign.apiKey);
  form.append("timestamp", String(sign.timestamp));
  form.append("folder", sign.folder);
  form.append("signature", sign.signature);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/${resourceType}/upload`, { method: "POST", body: form });
  const data = (await res.json()) as { secure_url?: string; error?: { message?: string } };
  if (!res.ok || !data.secure_url) throw new Error(data.error?.message ?? "Upload failed. Please try again.");
  return data.secure_url;
}

function MediaUpload({ value, onChange, kind = "image" }: { value: string; onChange: (v: string) => void; kind?: "image" | "audio" }) {
  const cfg = useQuery({ queryKey: ["media-config"], queryFn: () => apiGet<MediaConfig>("/admin/media/config"), staleTime: 5 * 60_000 });
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isAudio = kind === "audio";
  const noun = isAudio ? "audio" : "image";

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      onChange(await uploadToCloudinary(file, isAudio ? "video" : "image"));
      toast.success(`${isAudio ? "Audio" : "Image"} uploaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {value && (isAudio
        ? <audio controls src={value} className="w-full" />
        : <img src={value} alt="" className="h-28 w-full rounded-lg border border-border object-cover" />)}
      <div className="flex flex-wrap gap-2">
        {cfg.data?.enabled && (
          <>
            <input ref={inputRef} type="file" accept={isAudio ? "audio/*" : "image/*"} className="hidden" onChange={onFile} />
            <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={busy}>
              {busy ? "Uploading…" : value ? `Replace ${noun}` : `Upload ${noun}`}
            </Button>
          </>
        )}
        {value && <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>Remove</Button>}
      </div>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={`https://… ${noun} URL`} className="h-11" />
      {cfg.data && !cfg.data.enabled && (
        <p className="text-xs text-muted-foreground">Uploads aren't set up yet — paste a {noun} URL above. (Add Cloudinary keys to the server .env to enable uploads.)</p>
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

  if (!cfg.data?.enabled) return null;
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
