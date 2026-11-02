import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Bold, CheckCircle2, Hand, Heading2, Lightbulb, List, Loader2, Pencil,
  Plus, Save, Sparkles, Trash2, Wand2, Eye, PenLine,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AiQuizGenerator, MediaUpload } from "@/components/admin";
import { ContentImage, RichText } from "@/components/site";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import { lengthAdvice } from "@/lib/admin-course";
import { cn } from "@/lib/utils";
import type { Curriculum } from "./courses.$courseId.index";

export const Route = createFileRoute("/admin/lessons/$lessonId/")({ component: LessonEditor });

type Lesson = {
  id: string; course_id: string; module_id: string | null; slug: string; title: string; type: string;
  body_richtext: string; key_points: string[]; try_it_action: string | null; svg_motif: string | null;
  image_url: string | null; audio_url: string | null; video_url: string | null;
  est_minutes: number; is_published: boolean;
};
type Question = { id: string; lesson_id: string; question: string; options: string[]; correct_index: number; explanation: string; sort_order: number };

const MOTIFS = ["phone", "shield", "radio", "community", "circle"];

function LessonEditor() {
  const { lessonId } = Route.useParams();
  const lessonQ = useQuery({ queryKey: ["admin", "lesson", lessonId], queryFn: () => apiGet<Lesson>(`/admin/lessons/${lessonId}`) });
  if (lessonQ.isLoading) return <div className="grid place-items-center py-24"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  if (!lessonQ.data) return <p className="py-24 text-center text-muted-foreground">Lesson not found.</p>;
  return <Editor key={lessonQ.data.id} lesson={lessonQ.data} />;
}

function Editor({ lesson }: { lesson: Lesson }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const cur = useQuery({ queryKey: ["admin", "curriculum", lesson.course_id], queryFn: () => apiGet<Curriculum>(`/admin/courses/${lesson.course_id}/curriculum`) });
  const ai = useQuery({ queryKey: ["ai-admin-config"], queryFn: () => apiGet<{ enabled: boolean }>("/admin/ai/config"), staleTime: 5 * 60_000 });

  const [f, setF] = useState(() => ({
    title: lesson.title, type: lesson.type, module_id: lesson.module_id ?? "",
    body: lesson.body_richtext ?? "", key_points: (lesson.key_points ?? []).join("\n"), try_it: lesson.try_it_action ?? "",
    motif: lesson.svg_motif ?? "", image_url: lesson.image_url ?? "", audio_url: lesson.audio_url ?? "", video_url: lesson.video_url ?? "",
    est_minutes: String(lesson.est_minutes ?? 5), is_published: lesson.is_published,
  }));
  const [dirty, setDirty] = useState(false);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => { setF((s) => ({ ...s, [k]: v })); setDirty(true); };
  const [view, setView] = useState<"edit" | "preview">("edit");
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // Warn before closing the tab with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const words = useMemo(() => (f.body.trim() ? f.body.trim().split(/\s+/).length : 0), [f.body]);
  const len = lengthAdvice(words, f.type);
  const keyPoints = f.key_points.split("\n").map((s) => s.trim()).filter(Boolean);

  const save = useMutation({
    mutationFn: () => apiPatch(`/admin/lessons/${lesson.id}`, {
      title: f.title.trim(), type: f.type, module_id: f.module_id || null,
      body_richtext: f.body, key_points: keyPoints, try_it_action: f.try_it.trim() || null,
      svg_motif: f.motif || null, image_url: f.image_url || null, audio_url: f.audio_url || null, video_url: f.video_url || null,
      est_minutes: Math.max(1, Number(f.est_minutes) || 5), is_published: f.is_published,
    }),
    onSuccess: () => {
      toast.success("Lesson saved");
      setDirty(false);
      qc.invalidateQueries({ queryKey: ["admin", "lesson", lesson.id] });
      qc.invalidateQueries({ queryKey: ["admin", "curriculum", lesson.course_id] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save."),
  });

  // Ctrl/Cmd+S saves.
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); save.mutate(); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  // Toolbar: wrap/prefix the current selection in the body textarea.
  const format = (kind: "h2" | "bold" | "list") => {
    const el = bodyRef.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b, value } = el;
    const sel = value.slice(a, b);
    let out = "";
    if (kind === "bold") out = `**${sel || "bold text"}**`;
    if (kind === "h2") out = `${a > 0 && value[a - 1] !== "\n" ? "\n\n" : ""}## ${sel || "Sub-heading"}\n`;
    if (kind === "list") out = `${a > 0 && value[a - 1] !== "\n" ? "\n\n" : ""}${(sel || "First step\nSecond step").split("\n").map((l) => `- ${l.replace(/^- /, "")}`).join("\n")}\n`;
    set("body", value.slice(0, a) + out + value.slice(b));
    requestAnimationFrame(() => { el.focus(); el.selectionStart = el.selectionEnd = a + out.length; });
  };

  // Neighbours for "previous / next lesson" navigation in the editor.
  const flat = cur.data ? cur.data.modules.flatMap((m) => m.lessons) : [];
  const idx = flat.findIndex((l) => l.id === lesson.id);
  const prev = idx > 0 ? flat[idx - 1] : undefined;
  const next = idx >= 0 ? flat[idx + 1] : undefined;
  const go = (id: string) => {
    if (dirty && !window.confirm("You have unsaved changes. Leave without saving?")) return;
    navigate({ to: "/admin/lessons/$lessonId", params: { lessonId: id } });
  };

  const [aiOpen, setAiOpen] = useState<null | "draft" | "simplify" | "shorten" | "examples">(null);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm" className="-ml-2"><Link to="/admin/courses/$courseId" params={{ courseId: lesson.course_id }}><ArrowLeft className="size-4" />{cur.data?.course.title ?? "Course builder"}</Link></Button>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" disabled={!prev} onClick={() => prev && go(prev.id)}><ArrowLeft className="size-4" />Previous</Button>
          <Button variant="ghost" size="sm" disabled={!next} onClick={() => next && go(next.id)}>Next<ArrowRight className="size-4" /></Button>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="min-w-0 flex-1 font-display text-2xl font-extrabold md:text-3xl">{f.title || "Untitled lesson"}</h1>
        <div role="tablist" className="inline-flex rounded-full border border-border bg-card p-1 lg:hidden">
          {(["edit", "preview"] as const).map((k) => (
            <button key={k} role="tab" aria-selected={view === k} onClick={() => setView(k)}
              className={cn("inline-flex min-h-9 items-center gap-1.5 rounded-full px-4 text-sm font-semibold", view === k ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
              {k === "edit" ? <PenLine className="size-4" /> : <Eye className="size-4" />}{k === "edit" ? "Edit" : "Preview"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* ------------------------------------------------ edit column */}
        <div className={cn("space-y-5", view === "preview" && "hidden lg:block")}>
          <Card title="Basics">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><Label htmlFor="t">Title</Label><Input id="t" className="mt-1 h-11" value={f.title} onChange={(e) => set("title", e.target.value)} /></div>
              <div>
                <Label htmlFor="ty">Type</Label>
                <select id="ty" className="mt-1 h-11 w-full rounded-md border border-input bg-background px-3 text-sm" value={f.type} onChange={(e) => set("type", e.target.value)}>
                  <option value="read">Read</option><option value="quiz">Quiz (module check)</option><option value="practice">Practice</option><option value="scenario">Scenario</option>
                </select>
              </div>
              <div>
                <Label htmlFor="mo">Module</Label>
                <select id="mo" className="mt-1 h-11 w-full rounded-md border border-input bg-background px-3 text-sm" value={f.module_id} onChange={(e) => set("module_id", e.target.value)}>
                  <option value="">Not in a module</option>
                  {cur.data?.modules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>
              <div><Label htmlFor="mi">Minutes to complete</Label><Input id="mi" type="number" min={1} max={60} className="mt-1 h-11" value={f.est_minutes} onChange={(e) => set("est_minutes", e.target.value)} /></div>
              <div className="flex items-end">
                <div className="flex h-11 w-full items-center justify-between rounded-lg border border-border px-4">
                  <Label htmlFor="pub">Published</Label>
                  <Switch id="pub" checked={f.is_published} onCheckedChange={(v) => set("is_published", v)} />
                </div>
              </div>
            </div>
          </Card>

          {f.type !== "quiz" && (
            <Card title="Lesson text" right={
              <span className={cn("text-xs font-semibold", len.tone === "ok" ? "text-success" : len.tone === "warn" ? "text-warning" : "text-destructive")}>
                {words} words{len.label ? ` · ${len.label}` : ""} · aim for 150 to 300
              </span>
            }>
              <div className="mb-2 flex flex-wrap items-center gap-1">
                <ToolBtn label="Sub-heading" onClick={() => format("h2")}><Heading2 className="size-4" /></ToolBtn>
                <ToolBtn label="Bold" onClick={() => format("bold")}><Bold className="size-4" /></ToolBtn>
                <ToolBtn label="List" onClick={() => format("list")}><List className="size-4" /></ToolBtn>
                <span className="mx-1 h-6 w-px bg-border" />
                <AiButton enabled={!!ai.data?.enabled} onClick={() => setAiOpen("draft")}><Sparkles className="size-4" />{f.body.trim() ? "Redraft with AI" : "Draft with AI"}</AiButton>
                <AiButton enabled={!!ai.data?.enabled && !!f.body.trim()} onClick={() => setAiOpen("simplify")}><Wand2 className="size-4" />Simplify</AiButton>
                <AiButton enabled={!!ai.data?.enabled && !!f.body.trim()} onClick={() => setAiOpen("shorten")}>Shorten</AiButton>
                <AiButton enabled={!!ai.data?.enabled && !!f.body.trim()} onClick={() => setAiOpen("examples")}>Add Zambian examples</AiButton>
              </div>
              {ai.data && !ai.data.enabled && <p className="mb-2 text-xs text-muted-foreground">AI help is off. Add GEMINI_API_KEY or GROQ_API_KEY to server/.env and restart the API to turn it on.</p>}
              <Textarea ref={bodyRef} rows={16} className="font-mono text-sm leading-relaxed" value={f.body} onChange={(e) => set("body", e.target.value)}
                placeholder={"Start with one sentence on why this matters.\n\n## A short sub-heading\nShort sentences. One idea.\n\n- Step one\n- Step two"} />
              <p className="mt-1 text-xs text-muted-foreground">Leave a blank line between paragraphs. “## ” makes a sub-heading, “- ” a list item, **word** is bold, *words* are italic, “1. ” makes numbered steps.</p>
            </Card>
          )}

          {f.type !== "quiz" && (
            <Card title="Remember and try it">
              <Label htmlFor="kp">Key points (one per line, 2 to 4)</Label>
              <Textarea id="kp" rows={4} className="mt-1" value={f.key_points} onChange={(e) => set("key_points", e.target.value)} />
              <Label htmlFor="ti" className="mt-4 block">Try it yourself (one small, safe task)</Label>
              <Input id="ti" className="mt-1 h-11" value={f.try_it} onChange={(e) => set("try_it", e.target.value)} placeholder="Open your phone settings and find the battery saver." />
            </Card>
          )}

          <Card title="Quiz questions" right={<span className="text-xs text-muted-foreground">{f.type === "quiz" ? "This lesson is a check quiz: 3 to 5 questions." : "Optional: 1 to 3 quick questions after the lesson."}</span>}>
            <QuizEditor lessonId={lesson.id} />
          </Card>

          {f.type === "scenario" && (
            <Card title="Scenario steps">
              <p className="text-sm text-muted-foreground">Scenarios are a series of choices with feedback.</p>
              <Button asChild variant="outline" className="mt-3"><Link to="/admin/lessons/$lessonId/scenario" params={{ lessonId: lesson.id }}>Edit scenario steps<ArrowRight className="size-4" /></Link></Button>
            </Card>
          )}

          <Card title="Media (optional)">
            <div className="space-y-5">
              <div><Label>Picture</Label><p className="mb-2 text-xs text-muted-foreground">A clear photo or drawing. If empty, the illustration below is used.</p><MediaUpload value={f.image_url} onChange={(v) => set("image_url", v)} kind="image" /></div>
              <div>
                <Label htmlFor="mf">Illustration</Label>
                <select id="mf" className="mt-1 h-11 w-full rounded-md border border-input bg-background px-3 text-sm" value={f.motif} onChange={(e) => set("motif", e.target.value)}>
                  <option value="">Course default</option>
                  {MOTIFS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div><Label>Read-aloud audio</Label><p className="mb-2 text-xs text-muted-foreground">Strongly recommended for beginners: learners can listen instead of reading.</p><MediaUpload value={f.audio_url} onChange={(v) => set("audio_url", v)} kind="audio" /></div>
              <div><Label htmlFor="vu">Video (YouTube link)</Label><Input id="vu" className="mt-1 h-11" value={f.video_url} onChange={(e) => set("video_url", e.target.value)} placeholder="https://youtu.be/…" /><p className="mt-1 text-xs text-muted-foreground">Keep videos under 3 minutes. It only loads when a learner taps play.</p></div>
            </div>
          </Card>
        </div>

        {/* --------------------------------------------- preview column */}
        <div className={cn(view === "edit" && "hidden lg:block")}>
          <div className="lg:sticky lg:top-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Learner preview</p>
            <div className="mx-auto max-w-[400px] overflow-hidden rounded-[2rem] border-8 border-foreground/85 bg-background shadow-xl">
              <div className="max-h-[75vh] space-y-4 overflow-y-auto p-4">
                <p className="eyebrow">{cur.data?.course.title}</p>
                <h2 className="text-2xl">{f.title || "Untitled lesson"}</h2>
                {f.type !== "quiz" && (
                  <>
                    <div className="h-36 overflow-hidden rounded-2xl border border-border"><ContentImage src={f.image_url || null} motif={f.motif || null} alt="" /></div>
                    <div className="rounded-2xl border border-border bg-card p-4 text-[15px]">{f.body.trim() ? <RichText text={f.body} /> : <p className="text-muted-foreground">The lesson text shows here.</p>}</div>
                    {keyPoints.length > 0 && (
                      <div className="rounded-2xl border border-accent bg-accent-soft p-4">
                        <p className="flex items-center gap-2 font-semibold"><Lightbulb className="size-4 text-warning" />Remember</p>
                        <ul className="mt-2 space-y-1.5 text-sm">{keyPoints.map((k) => <li key={k} className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />{k}</li>)}</ul>
                      </div>
                    )}
                    {f.try_it.trim() && (
                      <div className="rounded-2xl bg-primary p-4 text-primary-foreground">
                        <p className="flex items-center gap-2 font-semibold"><Hand className="size-4 text-accent" />Try it yourself</p>
                        <p className="mt-1 text-sm">{f.try_it}</p>
                      </div>
                    )}
                  </>
                )}
                {f.type === "quiz" && <p className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">Learners answer the questions one by one, then see their score and a review.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 z-30 -mx-4 mt-6 border-t border-border bg-card/95 backdrop-blur md:-mx-8">
        <div className="flex items-center justify-end gap-3 px-4 py-3 md:px-8">
          <span className="mr-auto text-sm text-muted-foreground">{dirty ? "Unsaved changes" : "All changes saved"}</span>
          <Button onClick={() => save.mutate()} disabled={save.isPending || !dirty}><Save className="size-4" />{save.isPending ? "Saving…" : "Save lesson"}</Button>
        </div>
      </div>

      <AiWriterDialog
        mode={aiOpen} onClose={() => setAiOpen(null)}
        title={f.title} courseTitle={cur.data?.course.title ?? ""} body={f.body}
        onUse={(d) => {
          setF((s) => ({ ...s, body: d.body_richtext, key_points: d.key_points.length ? d.key_points.join("\n") : s.key_points, try_it: d.try_it_action || s.try_it }));
          setDirty(true);
          setAiOpen(null);
          toast.success("Draft added. Read it through, edit, then Save.");
        }}
      />
    </div>
  );
}

function Card({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold">{title}</h2>{right}</div>
      {children}
    </section>
  );
}

function ToolBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return <Button type="button" variant="ghost" size="icon" className="size-9" aria-label={label} title={label} onClick={onClick}>{children}</Button>;
}

function AiButton({ enabled, onClick, children }: { enabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return <Button type="button" variant="outline" size="sm" className="h-9" disabled={!enabled} onClick={onClick}>{children}</Button>;
}

/* ------------------------------------------------------------ AI writer */

type Draft = { body_richtext: string; key_points: string[]; try_it_action: string };

function AiWriterDialog({ mode, onClose, title, courseTitle, body, onUse }: {
  mode: null | "draft" | "simplify" | "shorten" | "examples"; onClose: () => void;
  title: string; courseTitle: string; body: string; onUse: (d: Draft) => void;
}) {
  const [notes, setNotes] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const gen = useMutation({
    mutationFn: () => apiPost<Draft>("/admin/ai/lesson-write", { mode, title, course_title: courseTitle, notes, body }),
    onSuccess: setDraft,
    onError: (e) => toast.error(e instanceof Error ? e.message : "The AI could not write that. Try again."),
  });
  // Rewrites start straight away; a new draft first asks for optional notes.
  useEffect(() => {
    setDraft(null);
    if (mode && mode !== "draft") gen.mutate();
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const heading = { draft: "Draft this lesson with AI", simplify: "Simpler version", shorten: "Shorter version", examples: "With Zambian examples" }[mode ?? "draft"];
  const w = draft?.body_richtext.trim() ? draft.body_richtext.trim().split(/\s+/).length : 0;

  return (
    <Dialog open={!!mode} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{heading}</DialogTitle></DialogHeader>
        {mode === "draft" && !draft && !gen.isPending && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">The AI writes a short, beginner-friendly lesson for “{title || "this lesson"}”. You review and edit before saving.</p>
            <Label htmlFor="notes">What should it cover? (optional)</Label>
            <Textarea id="notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="E.g. explain the PIN, never share it, what to do if someone asks for it." />
          </div>
        )}
        {gen.isPending && <div className="py-12 text-center text-muted-foreground"><Loader2 className="mx-auto size-6 animate-spin" /><p className="mt-2 text-sm">Writing…</p></div>}
        {draft && !gen.isPending && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground">{w} words</p>
            <div className="rounded-xl border border-border bg-background p-4"><RichText text={draft.body_richtext} /></div>
            {draft.key_points.length > 0 && <div className="rounded-xl bg-accent-soft p-3 text-sm"><p className="font-semibold">Remember</p><ul className="mt-1 list-disc pl-5">{draft.key_points.map((k) => <li key={k}>{k}</li>)}</ul></div>}
            {draft.try_it_action && <p className="rounded-xl bg-secondary p-3 text-sm"><span className="font-semibold">Try it: </span>{draft.try_it_action}</p>}
            <p className="text-xs text-muted-foreground">Check every fact before publishing. The AI can be wrong.</p>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          {mode === "draft" && !draft && <Button onClick={() => gen.mutate()} disabled={gen.isPending || !title.trim()}><Sparkles className="size-4" />Write draft</Button>}
          {draft && <Button variant="outline" onClick={() => gen.mutate()} disabled={gen.isPending}>Try again</Button>}
          {draft && <Button onClick={() => onUse(draft)} disabled={!draft.body_richtext}>Use this</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------ quiz editor */

function QuizEditor({ lessonId }: { lessonId: string }) {
  const qc = useQueryClient();
  const key = ["admin", "quiz-questions", lessonId];
  const list = useQuery({ queryKey: key, queryFn: () => apiGet<Question[]>(`/admin/quiz-questions?lesson_id=${lessonId}`) });
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const refresh = () => {
    qc.invalidateQueries({ queryKey: key });
    qc.invalidateQueries({ queryKey: ["admin", "curriculum"] });
  };

  const del = useMutation({ mutationFn: (id: string) => apiDelete(`/admin/quiz-questions/${id}`), onSuccess: () => { toast.success("Question removed"); refresh(); } });
  const swap = useMutation({
    mutationFn: async ([a, b]: [Question, Question]) => {
      await apiPatch(`/admin/quiz-questions/${a.id}`, { sort_order: b.sort_order === a.sort_order ? a.sort_order + 1 : b.sort_order });
      await apiPatch(`/admin/quiz-questions/${b.id}`, { sort_order: a.sort_order });
    },
    onSuccess: refresh,
  });

  const qs = list.data ?? [];
  return (
    <div className="space-y-3">
      {list.isLoading && <Loader2 className="size-5 animate-spin text-muted-foreground" />}
      {qs.map((q, i) => editing === q.id ? (
        <QuestionForm key={q.id} lessonId={lessonId} initial={q} nextOrder={q.sort_order} onDone={() => { setEditing(null); refresh(); }} onCancel={() => setEditing(null)} />
      ) : (
        <div key={q.id} className="rounded-xl border border-border p-4">
          <div className="flex items-start gap-2">
            <span className="text-sm font-bold text-muted-foreground">{i + 1}.</span>
            <p className="flex-1 font-medium">{q.question}</p>
            <div className="flex shrink-0 gap-0.5">
              <Button variant="ghost" size="icon" className="size-8" aria-label="Move up" disabled={i === 0} onClick={() => swap.mutate([q, qs[i - 1]!])}><ArrowUp className="size-4" /></Button>
              <Button variant="ghost" size="icon" className="size-8" aria-label="Move down" disabled={i === qs.length - 1} onClick={() => swap.mutate([q, qs[i + 1]!])}><ArrowDown className="size-4" /></Button>
              <Button variant="ghost" size="icon" className="size-8" aria-label="Edit question" onClick={() => setEditing(q.id)}><Pencil className="size-4" /></Button>
              <Button variant="ghost" size="icon" className="size-8" aria-label="Delete question" onClick={() => window.confirm("Delete this question?") && del.mutate(q.id)}><Trash2 className="size-4 text-destructive" /></Button>
            </div>
          </div>
          <ul className="mt-2 space-y-1 pl-6 text-sm">
            {q.options.map((o, j) => <li key={j} className={j === q.correct_index ? "font-semibold text-success" : "text-muted-foreground"}>{j === q.correct_index ? "✓ " : "• "}{o}</li>)}
          </ul>
          {q.explanation && <p className="mt-2 pl-6 text-xs text-muted-foreground">{q.explanation}</p>}
        </div>
      ))}
      {editing === "new" ? (
        <QuestionForm lessonId={lessonId} nextOrder={(qs.at(-1)?.sort_order ?? 0) + 1} onDone={() => { setEditing(null); refresh(); }} onCancel={() => setEditing(null)} />
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => setEditing("new")}><Plus className="size-4" />Add question</Button>
          <AiQuizGenerator lessonId={lessonId} />
        </div>
      )}
      {qs.length === 0 && editing !== "new" && <p className="text-sm text-muted-foreground">No questions yet. Write your own, or save the lesson text first and let AI suggest some.</p>}
    </div>
  );
}

function QuestionForm({ lessonId, initial, nextOrder, onDone, onCancel }: { lessonId: string; initial?: Question; nextOrder: number; onDone: () => void; onCancel: () => void }) {
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [options, setOptions] = useState<string[]>(initial?.options?.length ? initial.options : ["", "", ""]);
  const [correct, setCorrect] = useState(initial?.correct_index ?? 0);
  const [explanation, setExplanation] = useState(initial?.explanation ?? "");
  const save = useMutation({
    mutationFn: () => {
      const opts = options.map((o) => o.trim());
      const body = { lesson_id: lessonId, question: question.trim(), options: opts.filter(Boolean), correct_index: Math.min(correct, opts.filter(Boolean).length - 1), explanation: explanation.trim(), sort_order: nextOrder };
      return initial ? apiPatch(`/admin/quiz-questions/${initial.id}`, body) : apiPost("/admin/quiz-questions", body);
    },
    onSuccess: () => { toast.success(initial ? "Question saved" : "Question added"); onDone(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save the question."),
  });
  const valid = question.trim() && options.filter((o) => o.trim()).length >= 2 && options[correct]?.trim();
  return (
    <form className="space-y-3 rounded-xl border-2 border-primary/30 bg-primary-soft/20 p-4" onSubmit={(e) => { e.preventDefault(); if (valid) save.mutate(); }}>
      <div><Label htmlFor="qq">Question</Label><Textarea id="qq" rows={2} className="mt-1 bg-background" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Someone calls saying they are from Airtel and asks for your PIN. What do you do?" /></div>
      <fieldset>
        <legend className="text-sm font-medium">Answers (pick the correct one)</legend>
        <div className="mt-1 space-y-2">
          {options.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="radio" name="correct" aria-label={`Answer ${i + 1} is correct`} checked={correct === i} onChange={() => setCorrect(i)} className="size-5 shrink-0 accent-[var(--primary)]" />
              <Input value={o} onChange={(e) => setOptions((s) => s.map((x, j) => (j === i ? e.target.value : x)))} placeholder={`Answer ${i + 1}`} className={cn("h-10 bg-background", correct === i && "border-success")} />
              {options.length > 2 && <Button type="button" variant="ghost" size="icon" className="size-9 shrink-0" aria-label="Remove answer" onClick={() => { setOptions((s) => s.filter((_, j) => j !== i)); setCorrect((c) => (c >= i && c > 0 ? c - 1 : c)); }}><Trash2 className="size-4" /></Button>}
            </div>
          ))}
        </div>
        {options.length < 4 && <Button type="button" variant="ghost" size="sm" className="mt-1" onClick={() => setOptions((s) => [...s, ""])}><Plus className="size-4" />Add answer</Button>}
      </fieldset>
      <div><Label htmlFor="qe">Why is it correct? (shown after the quiz)</Label><Input id="qe" className="mt-1 h-10 bg-background" value={explanation} onChange={(e) => setExplanation(e.target.value)} /></div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={!valid || save.isPending}>{save.isPending ? "Saving…" : initial ? "Save question" : "Add question"}</Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
