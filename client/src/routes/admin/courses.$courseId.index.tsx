import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown, ArrowLeft, ArrowUp, BookOpen, Check, Compass, ExternalLink, Eye, EyeOff, GripVertical, Hand, HelpCircle,
  Loader2, Pencil, Plus, Trash2, X, Lightbulb, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { FieldInput, PublishBadge, toForm, toPayload } from "@/components/admin";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/lib/api";
import { lengthAdvice, slugify, useCourseFields } from "@/lib/admin-course";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/courses/$courseId/")({ component: Builder });

export type LessonRow = {
  id: string; module_id: string | null; slug: string; title: string; type: string; is_published: boolean;
  sort_order: number; est_minutes: number; words: number; quiz_count: number; scenario_count: number;
};
type ModuleRow = { id: string; title: string; summary: string; sort_order: number; lessons: LessonRow[] };
type CourseRow = Record<string, unknown> & { id: string; slug: string; title: string; is_published: boolean };
export type Curriculum = { course: CourseRow; modules: ModuleRow[]; unassigned: LessonRow[] };

const TYPES = [
  { value: "read", label: "Read", icon: BookOpen },
  { value: "quiz", label: "Quiz", icon: HelpCircle },
  { value: "practice", label: "Practice", icon: Hand },
  { value: "scenario", label: "Scenario", icon: Compass },
] as const;
const typeIcon = (t: string) => TYPES.find((x) => x.value === t)?.icon ?? BookOpen;

function Builder() {
  const { courseId } = Route.useParams();
  const [tab, setTab] = useState<"curriculum" | "details">("curriculum");
  const q = useQuery({ queryKey: ["admin", "curriculum", courseId], queryFn: () => apiGet<Curriculum>(`/admin/courses/${courseId}/curriculum`) });

  if (q.isLoading) return <div className="grid place-items-center py-24"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  if (q.isError || !q.data) return <p className="py-24 text-center text-muted-foreground">Could not load this course.</p>;
  const c = q.data.course;

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2"><Link to="/admin/courses"><ArrowLeft className="size-4" />All courses</Link></Button>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-extrabold md:text-3xl">{c.title}</h1>
            <PublishBadge published={c.is_published} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Course builder: modules, lessons and quizzes in one place.</p>
        </div>
        <Button asChild variant="outline"><a href={`/courses/${c.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4" />Preview as learner</a></Button>
      </div>

      <div role="tablist" className="mb-6 inline-flex rounded-full border border-border bg-card p-1">
        {(["curriculum", "details"] as const).map((k) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={cn("min-h-10 rounded-full px-5 text-sm font-semibold capitalize", tab === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
            {k === "curriculum" ? "Curriculum" : "Course details"}
          </button>
        ))}
      </div>

      {tab === "curriculum" ? <CurriculumEditor data={q.data} /> : <CourseDetails course={c} />}
    </>
  );
}

/* --------------------------------------------------------------- curriculum */

function CurriculumEditor({ data }: { data: Curriculum }) {
  const qc = useQueryClient();
  const courseId = data.course.id;
  const key = ["admin", "curriculum", courseId];
  const [modules, setModules] = useState<ModuleRow[]>(data.modules);
  useEffect(() => setModules(data.modules), [data.modules]);
  const refresh = () => qc.invalidateQueries({ queryKey: key });

  const [drag, setDrag] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ kind: "module" | "lesson"; id: string; title: string } | null>(null);

  // Persist order after every move; the UI updates first (optimistic).
  const saveOrder = useMutation({
    mutationFn: (next: ModuleRow[]) => apiPut(`/admin/courses/${courseId}/curriculum`, { modules: next.map((m) => ({ id: m.id, lessons: m.lessons.map((l) => l.id) })) }),
    onError: (e) => { toast.error(e instanceof Error ? e.message : "Could not save the new order."); refresh(); },
  });
  const apply = (next: ModuleRow[]) => { setModules(next); saveOrder.mutate(next); };

  const allLessons = useMemo(() => [...modules.flatMap((m) => m.lessons), ...data.unassigned], [modules, data.unassigned]);

  const moveLesson = (lessonId: string, toModule: string, toIndex: number) => {
    const lesson = allLessons.find((l) => l.id === lessonId);
    if (!lesson) return;
    const next = modules.map((m) => ({ ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }));
    const target = next.find((m) => m.id === toModule);
    if (!target) return;
    target.lessons.splice(Math.max(0, Math.min(toIndex, target.lessons.length)), 0, { ...lesson, module_id: toModule });
    apply(next);
  };
  const nudgeLesson = (m: ModuleRow, i: number, dir: -1 | 1) => {
    const mi = modules.findIndex((x) => x.id === m.id);
    if (i + dir < 0) { const prev = modules[mi - 1]; if (prev) moveLesson(m.lessons[i]!.id, prev.id, prev.lessons.length); return; }
    if (i + dir >= m.lessons.length) { const nxt = modules[mi + 1]; if (nxt) moveLesson(m.lessons[i]!.id, nxt.id, 0); return; }
    moveLesson(m.lessons[i]!.id, m.id, i + dir);
  };
  const nudgeModule = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= modules.length) return;
    const next = [...modules];
    [next[i], next[j]] = [next[j]!, next[i]!];
    apply(next);
  };

  const addModule = useMutation({
    mutationFn: () => apiPost("/admin/modules", { course_id: courseId, title: `Module ${modules.length + 1}`, sort_order: modules.length }),
    onSuccess: () => { toast.success("Module added. Click its title to rename it."); refresh(); },
    onError: () => toast.error("Could not add the module."),
  });
  const renameModule = useMutation({
    mutationFn: (v: { id: string; title: string; summary: string }) => apiPatch(`/admin/modules/${v.id}`, { title: v.title, summary: v.summary }),
    onSuccess: refresh,
    onError: () => toast.error("Could not rename the module."),
  });
  const addLesson = useMutation({
    mutationFn: async (v: { moduleId: string; title: string; type: string }) => {
      const taken = new Set(allLessons.map((l) => l.slug));
      let slug = slugify(v.title), n = 2;
      while (taken.has(slug)) slug = `${slugify(v.title)}-${n++}`;
      return apiPost("/admin/lessons", {
        course_id: courseId, module_id: v.moduleId, title: v.title, slug, type: v.type,
        is_published: false,
        // Same scheme the reorder endpoint uses, so learners see module order.
        sort_order: (modules.findIndex((m) => m.id === v.moduleId) + 1) * 1000 + (modules.find((m) => m.id === v.moduleId)?.lessons.length ?? 0), est_minutes: v.type === "quiz" ? 3 : 5,
      });
    },
    onSuccess: () => { toast.success("Lesson added as a draft. Open it to write the content."); refresh(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not add the lesson."),
  });
  const togglePublish = useMutation({
    mutationFn: (l: LessonRow) => apiPatch(`/admin/lessons/${l.id}`, { is_published: !l.is_published }),
    onSuccess: refresh,
    onError: () => toast.error("Could not change the lesson."),
  });
  const remove = useMutation({
    mutationFn: (v: { kind: "module" | "lesson"; id: string }) => apiDelete(`/admin/${v.kind === "module" ? "modules" : "lessons"}/${v.id}`),
    onSuccess: () => { toast.success("Deleted"); setConfirm(null); refresh(); },
    onError: () => toast.error("Could not delete."),
  });

  const totalMin = allLessons.reduce((n, l) => n + (l.est_minutes || 0), 0);
  const noCheck = modules.filter((m) => m.lessons.length > 0 && !m.lessons.some((l) => l.type === "quiz" && l.quiz_count > 0));
  const bigModules = modules.filter((m) => m.lessons.length > 7);
  const longLessons = allLessons.filter((l) => l.type !== "quiz" && l.words > 400);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
      <div className="space-y-4">
        {modules.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">No modules yet. Add the first module, then add lessons to it.</p>
        )}
        {modules.map((m, mi) => (
          <ModuleCard
            key={m.id} module={m} index={mi} count={modules.length}
            onUp={() => nudgeModule(mi, -1)} onDown={() => nudgeModule(mi, 1)}
            onRename={(title, summary) => renameModule.mutate({ id: m.id, title, summary })}
            onDelete={() => setConfirm({ kind: "module", id: m.id, title: m.title })}
            onAddLesson={(title, type) => addLesson.mutate({ moduleId: m.id, title, type })}
            adding={addLesson.isPending}
            onDropEnd={() => drag && moveLesson(drag, m.id, m.lessons.length)}
          >
            {m.lessons.map((l, li) => (
              <LessonItem
                key={l.id} lesson={l}
                onDragStart={() => setDrag(l.id)} onDragEnd={() => setDrag(null)}
                onDrop={() => drag && drag !== l.id && moveLesson(drag, m.id, li)}
                dragging={drag === l.id}
                onUp={() => nudgeLesson(m, li, -1)} onDown={() => nudgeLesson(m, li, 1)}
                upDisabled={mi === 0 && li === 0} downDisabled={mi === modules.length - 1 && li === m.lessons.length - 1}
                onTogglePublish={() => togglePublish.mutate(l)}
                onDelete={() => setConfirm({ kind: "lesson", id: l.id, title: l.title })}
              />
            ))}
          </ModuleCard>
        ))}

        {data.unassigned.length > 0 && (
          <div className="rounded-2xl border border-dashed border-warning bg-card p-4">
            <p className="font-semibold">Not in a module ({data.unassigned.length})</p>
            <p className="text-sm text-muted-foreground">Move these into a module so learners see them in the right place.</p>
            <ul className="mt-3 divide-y divide-border">
              {data.unassigned.map((l) => (
                <li key={l.id} className="flex flex-wrap items-center gap-2 py-2">
                  <span className="flex-1 font-medium">{l.title}</span>
                  <select aria-label="Move to module" className="h-9 rounded-md border border-input bg-background px-2 text-sm" value=""
                    onChange={(e) => e.target.value && moveLesson(l.id, e.target.value, Number.MAX_SAFE_INTEGER)}>
                    <option value="">Move to…</option>
                    {modules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
                  </select>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button variant="outline" onClick={() => addModule.mutate()} disabled={addModule.isPending} className="w-full border-dashed">
          <Plus className="size-4" />Add module
        </Button>
        {saveOrder.isPending && <p className="text-center text-xs text-muted-foreground">Saving order…</p>}
      </div>

      <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-semibold">This course</p>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-muted-foreground">Modules</dt><dd className="text-lg font-bold">{modules.length}</dd></div>
            <div><dt className="text-muted-foreground">Lessons</dt><dd className="text-lg font-bold">{allLessons.length}</dd></div>
            <div><dt className="text-muted-foreground">Published</dt><dd className="text-lg font-bold">{allLessons.filter((l) => l.is_published).length}</dd></div>
            <div><dt className="text-muted-foreground">About</dt><dd className="text-lg font-bold">{totalMin < 60 ? `${totalMin} min` : `${(totalMin / 60).toFixed(1)} h`}</dd></div>
          </dl>
          {(noCheck.length > 0 || bigModules.length > 0 || longLessons.length > 0) && (
            <ul className="mt-4 space-y-2 border-t border-border pt-3 text-sm">
              {noCheck.map((m) => <li key={m.id} className="flex gap-2"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />{m.title} has no check quiz yet.</li>)}
              {bigModules.map((m) => <li key={m.id} className="flex gap-2"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />{m.title} has {m.lessons.length} lessons. Split it.</li>)}
              {longLessons.slice(0, 4).map((l) => <li key={l.id} className="flex gap-2"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />“{l.title}” is {l.words} words.</li>)}
            </ul>
          )}
        </div>
        <div className="rounded-2xl border border-accent bg-accent-soft p-5 text-sm">
          <p className="flex items-center gap-2 font-semibold"><Lightbulb className="size-4 text-warning" />Beginner-friendly shape</p>
          <ul className="mt-3 space-y-1.5">
            <li>• 3 to 5 modules per course.</li>
            <li>• 3 to 6 lessons per module.</li>
            <li>• One idea per lesson, 150 to 300 words (3 to 5 minutes).</li>
            <li>• End each module with a check quiz of 3 to 5 questions.</li>
            <li>• Add a “Try it” task and audio where you can.</li>
          </ul>
          <p className="mt-3 text-muted-foreground">Drag lessons to reorder or move them between modules. On a phone, use the arrows.</p>
        </div>
      </aside>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{confirm?.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.kind === "module"
                ? "The module is removed. Its lessons are kept and listed under “Not in a module”."
                : "The lesson, its quiz questions and learners' progress on it are removed. This cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => confirm && remove.mutate(confirm)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ModuleCard({ module: m, index, count, children, onUp, onDown, onRename, onDelete, onAddLesson, adding, onDropEnd }: {
  module: ModuleRow; index: number; count: number; children: React.ReactNode;
  onUp: () => void; onDown: () => void; onRename: (title: string, summary: string) => void; onDelete: () => void;
  onAddLesson: (title: string, type: string) => void; adding: boolean; onDropEnd: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(m.title);
  const [summary, setSummary] = useState(m.summary);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("read");
  useEffect(() => { setTitle(m.title); setSummary(m.summary); }, [m.title, m.summary]);
  const mins = m.lessons.reduce((n, l) => n + (l.est_minutes || 0), 0);

  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onDropEnd(); }}>
      <header className="flex flex-wrap items-start gap-2 border-b border-border p-4">
        <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{index + 1}</span>
        {editing ? (
          <form className="flex min-w-0 flex-1 flex-col gap-2" onSubmit={(e) => { e.preventDefault(); if (title.trim()) { onRename(title.trim(), summary.trim()); setEditing(false); } }}>
            <Input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Module title" className="h-10" />
            <Input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="One line: what this module covers (optional)" aria-label="Module summary" className="h-10" />
            <div className="flex gap-2">
              <Button type="submit" size="sm"><Check className="size-4" />Save</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => { setEditing(false); setTitle(m.title); setSummary(m.summary); }}><X className="size-4" />Cancel</Button>
            </div>
          </form>
        ) : (
          <button className="min-w-0 flex-1 text-left" onClick={() => setEditing(true)} title="Rename module">
            <span className="font-display text-lg font-bold hover:text-primary">{m.title}</span>
            <span className="block text-xs text-muted-foreground">{m.summary || "Click to rename or add a summary"} · {m.lessons.length} lessons · {mins} min</span>
          </button>
        )}
        {!editing && (
          <div className="flex shrink-0 gap-0.5">
            <Button variant="ghost" size="icon" aria-label="Move module up" onClick={onUp} disabled={index === 0}><ArrowUp className="size-4" /></Button>
            <Button variant="ghost" size="icon" aria-label="Move module down" onClick={onDown} disabled={index === count - 1}><ArrowDown className="size-4" /></Button>
            <Button variant="ghost" size="icon" aria-label="Delete module" onClick={onDelete}><Trash2 className="size-4 text-destructive" /></Button>
          </div>
        )}
      </header>
      <ol className="divide-y divide-border">
        {children}
        {m.lessons.length === 0 && <li className="px-4 py-6 text-center text-sm text-muted-foreground">No lessons yet. Add one below or drag one here.</li>}
      </ol>
      <form className="flex flex-wrap gap-2 border-t border-border bg-muted/30 p-3"
        onSubmit={(e) => { e.preventDefault(); if (newTitle.trim()) { onAddLesson(newTitle.trim(), newType); setNewTitle(""); } }}>
        <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="New lesson title" aria-label="New lesson title" className="h-10 min-w-48 flex-1 bg-background" />
        <select value={newType} onChange={(e) => setNewType(e.target.value)} aria-label="Lesson type" className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <Button type="submit" size="sm" className="h-10" disabled={adding || !newTitle.trim()}><Plus className="size-4" />Add lesson</Button>
      </form>
    </section>
  );
}

function LessonItem({ lesson: l, onDragStart, onDragEnd, onDrop, dragging, onUp, onDown, upDisabled, downDisabled, onTogglePublish, onDelete }: {
  lesson: LessonRow; onDragStart: () => void; onDragEnd: () => void; onDrop: () => void; dragging: boolean;
  onUp: () => void; onDown: () => void; upDisabled: boolean; downDisabled: boolean; onTogglePublish: () => void; onDelete: () => void;
}) {
  const T = typeIcon(l.type);
  const len = lengthAdvice(l.words, l.type);
  const quizWarn = l.type === "quiz" && l.quiz_count < 3;
  return (
    <li draggable onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; onDragStart(); }} onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onDrop(); }}
      className={cn("grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-1 px-3 py-2.5 sm:flex sm:flex-nowrap", dragging && "opacity-40")}>
      <GripVertical className="hidden size-4 shrink-0 cursor-grab text-muted-foreground sm:block" aria-hidden="true" />
      <T className="size-4 shrink-0 text-primary" aria-label={l.type} />
      <Link to="/admin/lessons/$lessonId" params={{ lessonId: l.id }} className="min-w-0 flex-1">
        <span className="block truncate font-medium hover:text-primary">{l.title}</span>
        <span className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          {l.type !== "quiz" && <span className={cn(len.tone === "warn" && "text-warning", len.tone === "bad" && "text-destructive")}>{l.words} words{len.tone !== "ok" ? ` · ${len.label}` : ""}</span>}
          <span>{l.est_minutes} min</span>
          {(l.quiz_count > 0 || l.type === "quiz") && <span className={cn(quizWarn && "text-warning")}>{l.quiz_count} question{l.quiz_count === 1 ? "" : "s"}</span>}
          {!l.is_published && <span className="rounded-full bg-muted px-1.5 font-semibold">Draft</span>}
        </span>
      </Link>
      <div className="col-span-2 flex shrink-0 justify-end gap-0.5 sm:col-span-1">
        <Button variant="ghost" size="icon" aria-label="Move up" onClick={onUp} disabled={upDisabled}><ArrowUp className="size-4" /></Button>
        <Button variant="ghost" size="icon" aria-label="Move down" onClick={onDown} disabled={downDisabled}><ArrowDown className="size-4" /></Button>
        <Button variant="ghost" size="icon" aria-label={l.is_published ? "Unpublish" : "Publish"} title={l.is_published ? "Published: click to hide" : "Draft: click to publish"} onClick={onTogglePublish}>
          {l.is_published ? <Eye className="size-4 text-success" /> : <EyeOff className="size-4" />}
        </Button>
        <Button asChild variant="ghost" size="icon" aria-label="Edit lesson"><Link to="/admin/lessons/$lessonId" params={{ lessonId: l.id }}><Pencil className="size-4" /></Link></Button>
        <Button variant="ghost" size="icon" aria-label="Delete lesson" onClick={onDelete}><Trash2 className="size-4 text-destructive" /></Button>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ details */

function CourseDetails({ course }: { course: CourseRow }) {
  const qc = useQueryClient();
  const fields = useCourseFields();
  const [form, setForm] = useState(() => toForm(fields, course));
  // Options for selects load async; re-seed once they arrive without losing edits to other fields.
  useEffect(() => { setForm((f) => ({ ...toForm(fields, course), ...f })); }, [fields.length]); // eslint-disable-line react-hooks/exhaustive-deps
  const save = useMutation({
    mutationFn: () => apiPatch(`/admin/courses/${course.id}`, toPayload(fields, form)),
    onSuccess: () => { toast.success("Course saved"); qc.invalidateQueries({ queryKey: ["admin"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save."),
  });
  return (
    <form className="max-w-2xl space-y-4 rounded-2xl border border-border bg-card p-5 md:p-6" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
      {fields.map((f) => <FieldInput key={f.name} field={f} value={form[f.name]} onChange={(v) => setForm((s) => ({ ...s, [f.name]: v }))} />)}
      <div className="sticky bottom-0 -mx-5 -mb-5 border-t border-border bg-card/95 p-4 backdrop-blur md:-mx-6 md:-mb-6">
        <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save course details"}</Button>
      </div>
    </form>
  );
}
