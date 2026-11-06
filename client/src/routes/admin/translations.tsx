import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, Bot, Check, CheckCheck, Circle, Loader2, Plus, Save, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/translations")({ component: TranslationsAdmin });

/* ------------------------------------------------------------------ types */

type Lang = "bem" | "nya";
const LANGS: { code: Lang; label: string }[] = [{ code: "bem", label: "Bemba" }, { code: "nya", label: "Nyanja" }];
type Value = string | string[];
type FieldSpec = { name: string; type: "text" | "longtext" | "list"; label: string };
type Tr = { value: Value; status: "approved" | "draft"; origin: "human" | "ai"; stale: boolean; updated_at: string };
type Unit = { entityType: string; entityId: string; label: string; fields: FieldSpec[]; source: Record<string, Value>; translations: Record<Lang, Record<string, Tr>> };
type Counts = { total: number; approved: number; draft: number; stale: number; missing: number };
type Status = "done" | "review" | "todo" | "changed";
type CourseRow = {
  id: string; slug: string; title: string; counts: Counts;
  modules: { id: string; title: string }[];
  lessons: { id: string; title: string; type: string; module_id: string | null }[];
  status: Record<string, Status>;
};
type Job = { id: string; lang: Lang; courseId: string; courseTitle: string; status: "running" | "done" | "failed"; done: number; total: number; written: number; failed: number; error?: string };
type Overview = { aiEnabled: boolean; courses: CourseRow[]; job: Job | null };
type Screen = { kind: "course" | "lesson"; id: string; title: string };
type GlossaryRow = { id: string; term: string; bem: string; nya: string; note: string };

const STATUS: Record<Status, { label: string; dot: string }> = {
  done: { label: "Approved", dot: "bg-success" },
  review: { label: "To review", dot: "bg-accent" },
  todo: { label: "Not started", dot: "bg-muted-foreground/40" },
  changed: { label: "English changed", dot: "bg-destructive" },
};

/* ----------------------------------------------------------------- screen */

function TranslationsAdmin() {
  const [lang, setLang] = useState<Lang>("bem");
  const [tab, setTab] = useState<"courses" | "glossary">("courses");
  const [courseId, setCourseId] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen | null>(null);
  const qc = useQueryClient();

  const overview = useQuery({ queryKey: ["admin", "tr-overview", lang], queryFn: () => apiGet<Overview>(`/admin/translations/overview?lang=${lang}`) });
  const course = overview.data?.courses.find((c) => c.id === courseId) ?? null;

  // Keep the overview fresh while a whole-course job runs.
  const job = overview.data?.job ?? null;
  const running = job?.status === "running";
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => qc.invalidateQueries({ queryKey: ["admin", "tr-overview", lang] }), 4000);
    return () => clearInterval(t);
  }, [running, lang, qc]);
  const [lastJobStatus, setLastJobStatus] = useState<string | null>(null);
  useEffect(() => {
    if (!job) return;
    if (lastJobStatus === "running" && job.status !== "running") {
      if (job.status === "done") toast.success(`AI drafts ready for ${job.courseTitle}: ${job.written} fields. Review them before approving.`, { duration: 8000 });
      else toast.error(job.error ?? "The translation job stopped.");
      qc.invalidateQueries({ queryKey: ["admin", "tr-unit"] });
    }
    setLastJobStatus(job.status);
  }, [job, lastJobStatus, qc]);

  const startJob = useMutation({
    mutationFn: (id: string) => apiPost<Job>("/admin/translations/jobs", { lang, courseId: id }),
    onSuccess: () => { setLastJobStatus("running"); qc.invalidateQueries({ queryKey: ["admin", "tr-overview", lang] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not start."),
  });

  return (
    <>
      <AdminHeader
        title="Translations"
        description="Bemba and Nyanja versions of every course. AI can draft them; nothing reaches learners until a person approves it."
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-xl border border-border bg-card p-1" role="tablist" aria-label="Language">
          {LANGS.map((l) => (
            <button key={l.code} role="tab" aria-selected={lang === l.code} onClick={() => setLang(l.code)}
              className={cn("rounded-lg px-4 py-2 text-sm font-semibold", lang === l.code ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              {l.label}
            </button>
          ))}
        </div>
        <div className="inline-flex rounded-xl border border-border bg-card p-1" role="tablist" aria-label="Section">
          {(["courses", "glossary"] as const).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
              className={cn("rounded-lg px-4 py-2 text-sm font-semibold capitalize", tab === t ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground")}>
              {t === "courses" ? "Courses" : "Glossary"}
            </button>
          ))}
        </div>
        {overview.data && !overview.data.aiEnabled && (
          <p className="text-xs text-muted-foreground">AI suggestions are off: add a Gemini or Groq key to the server settings.</p>
        )}
      </div>

      {running && job && (
        <div className="mb-5 rounded-2xl border border-primary/30 bg-primary-soft/40 p-4" role="status">
          <p className="flex items-center gap-2 text-sm font-semibold"><Loader2 className="size-4 animate-spin" />AI is drafting {LANGS.find((l) => l.code === job.lang)?.label} for {job.courseTitle}: {job.done} of {job.total} parts</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-background"><div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${Math.round((job.done / Math.max(job.total, 1)) * 100)}%` }} /></div>
          <p className="mt-1 text-xs text-muted-foreground">You can keep working. Drafts appear as each part finishes.</p>
        </div>
      )}

      {tab === "glossary" ? <Glossary /> : overview.isLoading ? (
        <div className="grid place-items-center py-16"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : screen && course ? (
        <Editor lang={lang} screen={screen} course={course} aiEnabled={!!overview.data?.aiEnabled} onBack={() => setScreen(null)} onPick={setScreen} />
      ) : course ? (
        <CourseScreens course={course} lang={lang} onBack={() => setCourseId(null)} onPick={setScreen}
          onDraftAll={() => startJob.mutate(course.id)} aiEnabled={!!overview.data?.aiEnabled} busy={running || startJob.isPending} />
      ) : (
        <CourseList courses={overview.data?.courses ?? []} onPick={(id) => { setCourseId(id); setScreen(null); }}
          onDraftAll={(id) => startJob.mutate(id)} aiEnabled={!!overview.data?.aiEnabled} busy={running || startJob.isPending} />
      )}
    </>
  );
}

/* ------------------------------------------------------------- progress */

function ProgressBar({ c }: { c: Counts }) {
  const pct = (n: number) => `${(n / Math.max(c.total, 1)) * 100}%`;
  return (
    <div>
      <div className="flex h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <div className="bg-success" style={{ width: pct(c.approved) }} />
        <div className="bg-accent" style={{ width: pct(c.draft) }} />
        <div className="bg-destructive" style={{ width: pct(c.stale) }} />
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        {c.approved} of {c.total} approved{c.draft ? ` · ${c.draft} to review` : ""}{c.stale ? ` · ${c.stale} English changed` : ""}{c.missing ? ` · ${c.missing} not started` : ""}
      </p>
    </div>
  );
}

function CourseList({ courses, onPick, onDraftAll, aiEnabled, busy }: { courses: CourseRow[]; onPick: (id: string) => void; onDraftAll: (id: string) => void; aiEnabled: boolean; busy: boolean }) {
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {courses.map((c) => (
        <li key={c.id} className="rounded-2xl border border-border bg-card p-4">
          <button onClick={() => onPick(c.id)} className="block w-full text-left">
            <p className="font-semibold hover:text-primary">{c.title}</p>
            <div className="mt-2"><ProgressBar c={c.counts} /></div>
          </button>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => onPick(c.id)}>Open</Button>
            {aiEnabled && c.counts.missing > 0 && (
              <Button size="sm" variant="outline" disabled={busy} onClick={() => onDraftAll(c.id)}><Sparkles className="size-4" />Draft {c.counts.missing} with AI</Button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function CourseScreens({ course, lang, onBack, onPick, onDraftAll, aiEnabled, busy }: {
  course: CourseRow; lang: Lang; onBack: () => void; onPick: (s: Screen) => void; onDraftAll: () => void; aiEnabled: boolean; busy: boolean;
}) {
  const row = (s: Screen, st: Status | undefined) => (
    <li key={s.id}>
      <button onClick={() => onPick(s)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-secondary/60">
        <span className={cn("size-2.5 shrink-0 rounded-full", STATUS[st ?? "todo"].dot)} aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{s.title}</span>
        <span className="shrink-0 text-xs text-muted-foreground">{STATUS[st ?? "todo"].label}</span>
      </button>
    </li>
  );
  return (
    <div className="space-y-4">
      <button onClick={onBack} className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />All courses</button>
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1"><h2 className="text-lg font-semibold">{course.title}</h2><div className="mt-2 max-w-md"><ProgressBar c={course.counts} /></div></div>
          {aiEnabled && course.counts.missing > 0 && (
            <Button disabled={busy} onClick={onDraftAll}><Sparkles className="size-4" />Draft the rest in {LANGS.find((l) => l.code === lang)?.label} with AI</Button>
          )}
        </div>
      </div>
      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {row({ kind: "course", id: course.id, title: "Course details and module titles" }, course.status[`course:${course.id}`])}
        {course.lessons.map((l, i) => row({ kind: "lesson", id: l.id, title: `${i + 1}. ${l.title}` }, course.status[`lesson:${l.id}`]))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ editor */

type Form = Record<string, Value>; // key: `${entityId}|${field}`

function Editor({ lang, screen, course, aiEnabled, onBack, onPick }: { lang: Lang; screen: Screen; course: CourseRow; aiEnabled: boolean; onBack: () => void; onPick: (s: Screen) => void }) {
  const qc = useQueryClient();
  const key = ["admin", "tr-unit", screen.kind, screen.id];
  const units = useQuery({ queryKey: key, queryFn: () => apiGet<Unit[]>(`/admin/translations/unit/${screen.kind}/${screen.id}`) });
  const [form, setForm] = useState<Form>({});
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [suggesting, setSuggesting] = useState<string | null>(null);

  // Load the form from the server whenever the data or language changes, keeping unsaved edits.
  useEffect(() => {
    if (!units.data) return;
    setForm((prev) => {
      const next: Form = {};
      for (const u of units.data) for (const f of u.fields) {
        const k = `${u.entityId}|${f.name}`;
        if (dirty.has(k) && prev[k] !== undefined) { next[k] = prev[k]!; continue; }
        const t = u.translations[lang][f.name]?.value;
        const src = u.source[f.name];
        next[k] = f.type === "list"
          ? (Array.isArray(src) ? src : []).map((_, i) => (Array.isArray(t) ? t[i] ?? "" : ""))
          : typeof t === "string" ? t : "";
      }
      return next;
    });
  }, [units.data, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setDirty(new Set()); }, [lang, screen.id]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: key });
    qc.invalidateQueries({ queryKey: ["admin", "tr-overview", lang] });
  };

  const save = useMutation({
    mutationFn: () => {
      const byUnit = new Map<string, { entityType: string; entityId: string; fields: Record<string, Value> }>();
      for (const k of dirty) {
        const [id, field] = k.split("|") as [string, string];
        const u = units.data!.find((x) => x.entityId === id)!;
        const entry = byUnit.get(id) ?? { entityType: u.entityType, entityId: id, fields: {} };
        entry.fields[field] = form[k]!;
        byUnit.set(id, entry);
      }
      return apiPut("/admin/translations/save", { lang, units: [...byUnit.values()] });
    },
    onSuccess: () => { toast.success("Saved and approved"); setDirty(new Set()); refresh(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save."),
  });

  const approve = useMutation({
    mutationFn: (items: { entityType: string; entityId: string; fields?: string[] }[]) => apiPost<{ approved: number }>("/admin/translations/approve", { lang, units: items }),
    onSuccess: (r) => { toast.success(r.approved ? `Approved ${r.approved} field${r.approved === 1 ? "" : "s"}` : "Nothing to approve"); refresh(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not approve."),
  });

  const suggest = async (items: { entityType: string; entityId: string }[], fields: string[] | undefined, tag: string, overwrite = false) => {
    setSuggesting(tag);
    try {
      const r = await apiPost<{ asked: number; written: number; failed: number }>("/admin/translations/suggest", { lang, units: items, fields, overwrite });
      // Drop local edits for the fields that were just drafted, so the draft shows.
      setDirty((d) => { const n = new Set(d); for (const it of items) for (const k of [...n]) if (k.startsWith(`${it.entityId}|`) && (!fields || fields.includes(k.split("|")[1]!))) n.delete(k); return n; });
      if (!r.asked) toast("Nothing left to draft here.");
      else if (r.failed && !r.written) toast.error("The AI reply could not be used. Try again.");
      else toast.success(`AI drafted ${r.written} field${r.written === 1 ? "" : "s"}${r.failed ? `, ${r.failed} could not be used` : ""}. Check and approve.`);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI suggestion failed.");
    } finally {
      setSuggesting(null);
    }
  };

  const setVal = (k: string, v: Value) => { setForm((f) => ({ ...f, [k]: v })); setDirty((d) => new Set(d).add(k)); };

  const all = units.data ?? [];
  const toReview = all.flatMap((u) => u.fields.filter((f) => { const t = u.translations[lang][f.name]; return t && (t.status === "draft" || t.stale); }).map(() => u)).length;

  // Neighbouring screens for quick moves.
  const screens: Screen[] = [{ kind: "course", id: course.id, title: "Course details and module titles" }, ...course.lessons.map((l, i) => ({ kind: "lesson" as const, id: l.id, title: `${i + 1}. ${l.title}` }))];
  const at = screens.findIndex((s) => s.id === screen.id);
  const langLabel = LANGS.find((l) => l.code === lang)!.label;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button onClick={onBack} className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />{course.title}</button>
        <h2 className="w-full text-lg font-semibold sm:w-auto">{screen.title}</h2>
        <div className="ml-auto flex flex-wrap gap-2">
          {aiEnabled && (
            <Button variant="outline" size="sm" disabled={!!suggesting} onClick={() => suggest(all.map((u) => ({ entityType: u.entityType, entityId: u.entityId })), undefined, "all")}>
              {suggesting === "all" ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}Draft missing with AI
            </Button>
          )}
          {toReview > 0 && (
            <Button variant="outline" size="sm" disabled={approve.isPending || dirty.size > 0} title={dirty.size ? "Save your edits first" : undefined}
              onClick={() => approve.mutate(all.map((u) => ({ entityType: u.entityType, entityId: u.entityId })))}>
              <CheckCheck className="size-4" />Approve all {toReview} on this page
            </Button>
          )}
        </div>
      </div>

      {units.isLoading ? <div className="grid place-items-center py-16"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div> : (
        <div className="space-y-5">
          {all.map((u) => (
            <section key={u.entityId} className="rounded-2xl border border-border bg-card">
              <header className="border-b border-border px-4 py-3"><h3 className="font-semibold">{u.label}</h3></header>
              <div className="divide-y divide-border">
                {u.fields.map((f) => {
                  const src = u.source[f.name];
                  const empty = Array.isArray(src) ? src.length === 0 : !String(src ?? "").trim();
                  if (empty) return null;
                  const k = `${u.entityId}|${f.name}`;
                  const tr = u.translations[lang][f.name];
                  const edited = dirty.has(k);
                  const state = edited ? "edited" : !tr ? "missing" : tr.stale ? "stale" : tr.status === "draft" ? "draft" : "approved";
                  return (
                    <div key={f.name} className="grid gap-3 p-4 lg:grid-cols-2">
                      <div className="min-w-0">
                        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">{f.label}, English</p>
                        {Array.isArray(src) ? (
                          <ol className="space-y-1.5 text-sm">{src.map((s, i) => <li key={i} className="rounded-lg bg-secondary/60 px-3 py-2">{s}</li>)}</ol>
                        ) : (
                          <div className={cn("whitespace-pre-wrap rounded-lg bg-secondary/60 px-3 py-2 text-sm", f.type === "longtext" && "max-h-80 overflow-y-auto")}>{src}</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="mb-1 flex items-center gap-2">
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{langLabel}</p>
                          <StateChip state={state} origin={tr?.origin} />
                        </div>
                        {f.type === "list" ? (
                          <ol className="space-y-1.5">
                            {(Array.isArray(src) ? src : []).map((_, i) => (
                              <li key={i}>
                                <Input name={`${k}-${i}`} aria-label={`${f.label} ${i + 1} in ${langLabel}`} className="h-10"
                                  value={(form[k] as string[] | undefined)?.[i] ?? ""}
                                  onChange={(e) => { const arr = [...((form[k] as string[]) ?? [])]; arr[i] = e.target.value; setVal(k, arr); }} />
                              </li>
                            ))}
                          </ol>
                        ) : f.type === "longtext" ? (
                          <Textarea name={k} aria-label={`${f.label} in ${langLabel}`} rows={Math.min(16, Math.max(4, String(src).split("\n").length + 1))} className="text-sm"
                            value={(form[k] as string) ?? ""} onChange={(e) => setVal(k, e.target.value)} />
                        ) : (
                          <Input name={k} aria-label={`${f.label} in ${langLabel}`} className="h-10" value={(form[k] as string) ?? ""} onChange={(e) => setVal(k, e.target.value)} />
                        )}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {aiEnabled && (
                            <Button type="button" variant="ghost" size="sm" disabled={!!suggesting}
                              onClick={() => suggest([{ entityType: u.entityType, entityId: u.entityId }], [f.name], k, state === "approved")}>
                              {suggesting === k ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}{state === "missing" ? "Suggest" : "Suggest again"}
                            </Button>
                          )}
                          {(state === "draft" || state === "stale") && (
                            <Button type="button" variant="outline" size="sm" disabled={approve.isPending}
                              onClick={() => approve.mutate([{ entityType: u.entityType, entityId: u.entityId, fields: [f.name] }])}>
                              <Check className="size-4" />{state === "stale" ? "Still correct" : "Approve"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
          {all.length === 0 && <p className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">Nothing to translate here.</p>}
        </div>
      )}

      <div className="sticky bottom-0 z-20 -mx-4 -mb-4 mt-6 border-t border-border bg-card/95 backdrop-blur md:-mx-8 md:-mb-8">
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 md:px-8">
          <Button variant="ghost" size="sm" disabled={at <= 0} onClick={() => onPick(screens[at - 1]!)}><ArrowLeft className="size-4" />Previous</Button>
          <Button variant="ghost" size="sm" disabled={at >= screens.length - 1} onClick={() => onPick(screens[at + 1]!)}>Next</Button>
          <span className="ml-auto text-sm text-muted-foreground">{dirty.size ? `${dirty.size} unsaved change${dirty.size === 1 ? "" : "s"}` : "All saved"}</span>
          <Button onClick={() => save.mutate()} disabled={!dirty.size || save.isPending}>
            {save.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}Save and approve
          </Button>
        </div>
      </div>
    </div>
  );
}

function StateChip({ state, origin }: { state: "missing" | "draft" | "stale" | "approved" | "edited"; origin?: string }) {
  const map = {
    missing: { cls: "bg-muted text-muted-foreground", icon: Circle, text: "Not translated, English shows" },
    draft: { cls: "bg-accent/25 text-accent-foreground", icon: Bot, text: "AI draft, not live yet" },
    stale: { cls: "bg-destructive/15 text-destructive", icon: AlertTriangle, text: "English changed, check it" },
    approved: { cls: "bg-success/15 text-success", icon: Check, text: origin === "ai" ? "Approved (AI, checked)" : "Approved" },
    edited: { cls: "bg-primary-soft text-primary", icon: Save, text: "Edited, not saved" },
  }[state];
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", map.cls)}><map.icon className="size-3" aria-hidden="true" />{map.text}</span>;
}

/* ---------------------------------------------------------------- glossary */

function Glossary() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["admin", "glossary"], queryFn: () => apiGet<GlossaryRow[]>("/admin/translations/glossary") });
  const [draft, setDraft] = useState({ term: "", bem: "", nya: "", note: "" });
  const [q, setQ] = useState("");
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "glossary"] });
  const add = useMutation({
    mutationFn: () => apiPost("/admin/translations/glossary", draft),
    onSuccess: () => { setDraft({ term: "", bem: "", nya: "", note: "" }); refresh(); toast.success("Added to the glossary"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not add."),
  });
  const update = useMutation({
    mutationFn: (r: GlossaryRow) => apiPatch(`/admin/translations/glossary/${r.id}`, r),
    onSuccess: () => { refresh(); toast.success("Saved"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save."),
  });
  const del = useMutation({ mutationFn: (id: string) => apiDelete(`/admin/translations/glossary/${id}`), onSuccess: refresh });
  const rows = useMemo(() => (list.data ?? []).filter((r) => !q || `${r.term} ${r.bem} ${r.nya}`.toLowerCase().includes(q.toLowerCase())), [list.data, q]);

  return (
    <div className="space-y-4">
      <p className="max-w-2xl text-sm text-muted-foreground">
        Agreed words and phrases. The AI always uses them, so the same idea is said the same way across every course. Put the English in the first column and how it should appear in each language. Write the English word itself to keep it unchanged (like PIN or WhatsApp).
      </p>
      <form className="grid gap-2 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]" onSubmit={(e) => { e.preventDefault(); if (draft.term.trim()) add.mutate(); }}>
        <Input name="g-term" aria-label="English" placeholder="English, e.g. mobile money" value={draft.term} onChange={(e) => setDraft({ ...draft, term: e.target.value })} className="h-10" />
        <Input name="g-bem" aria-label="Bemba" placeholder="Bemba" value={draft.bem} onChange={(e) => setDraft({ ...draft, bem: e.target.value })} className="h-10" />
        <Input name="g-nya" aria-label="Nyanja" placeholder="Nyanja" value={draft.nya} onChange={(e) => setDraft({ ...draft, nya: e.target.value })} className="h-10" />
        <Input name="g-note" aria-label="Note" placeholder="Note (optional)" value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} className="h-10" />
        <Button type="submit" disabled={!draft.term.trim() || add.isPending}><Plus className="size-4" />Add</Button>
      </form>
      <Input name="g-search" aria-label="Search the glossary" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} className="h-10 max-w-xs" />
      {list.isLoading ? <Loader2 className="size-5 animate-spin text-muted-foreground" /> : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {rows.map((r) => <GlossaryItem key={r.id} row={r} onSave={(x) => update.mutate(x)} onDelete={() => del.mutate(r.id)} />)}
          {rows.length === 0 && <li className="p-4 text-sm text-muted-foreground">No terms yet.</li>}
        </ul>
      )}
    </div>
  );
}

function GlossaryItem({ row, onSave, onDelete }: { row: GlossaryRow; onSave: (r: GlossaryRow) => void; onDelete: () => void }) {
  const [r, setR] = useState(row);
  useEffect(() => setR(row), [row]);
  const changed = JSON.stringify(r) !== JSON.stringify(row);
  return (
    <li className="grid gap-2 p-3 sm:grid-cols-[1fr_1fr_1fr_1fr_auto] sm:items-center">
      <Input name={`t-${row.id}`} aria-label="English" value={r.term} onChange={(e) => setR({ ...r, term: e.target.value })} className="h-9 font-semibold" />
      <Input name={`b-${row.id}`} aria-label="Bemba" value={r.bem} onChange={(e) => setR({ ...r, bem: e.target.value })} className="h-9" />
      <Input name={`n-${row.id}`} aria-label="Nyanja" value={r.nya} onChange={(e) => setR({ ...r, nya: e.target.value })} className="h-9" />
      <Input name={`o-${row.id}`} aria-label="Note" value={r.note} onChange={(e) => setR({ ...r, note: e.target.value })} className="h-9 text-muted-foreground" />
      <div className="flex gap-1">
        <Button size="sm" variant="outline" disabled={!changed} onClick={() => onSave(r)}>Save</Button>
        <Button size="sm" variant="ghost" aria-label={`Delete ${row.term}`} onClick={onDelete}><Trash2 className="size-4" /></Button>
      </div>
    </li>
  );
}
