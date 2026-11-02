import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiGet, apiPut } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/translations")({
  component: TranslationsAdmin,
});

type TargetLesson = { id: string; slug: string; title: string; type: string };
type Target = { id: string; slug: string; title: string; lessons: TargetLesson[] };
type FieldSpec = { name: string; type: "text" | "longtext" | "list"; label: string };
type Detail = {
  entityType: string;
  entityId: string;
  fields: FieldSpec[];
  source: Record<string, unknown>;
  translations: Record<string, Record<string, unknown>>;
};

const LANGS = [
  { code: "bem", label: "Bemba" },
  { code: "nya", label: "Nyanja" },
] as const;

function TranslationsAdmin() {
  const qc = useQueryClient();
  const targets = useQuery({ queryKey: ["admin", "tr-targets"], queryFn: () => apiGet<Target[]>("/admin/translations/targets") });

  const [courseId, setCourseId] = useState<string>("");
  // sel is "course" or a lesson id
  const [sel, setSel] = useState<string>("course");
  const [lang, setLang] = useState<string>("bem");

  const course = targets.data?.find((c) => c.id === courseId);
  // default to first course once loaded
  useEffect(() => {
    if (!courseId && targets.data && targets.data.length) setCourseId(targets.data[0]!.id);
  }, [targets.data, courseId]);
  useEffect(() => { setSel("course"); }, [courseId]);

  const entityType = sel === "course" ? "course" : "lesson";
  const entityId = sel === "course" ? courseId : sel;

  const detail = useQuery({
    queryKey: ["admin", "tr-detail", entityType, entityId],
    enabled: !!entityId,
    queryFn: () => apiGet<Detail>(`/admin/translations/${entityType}/${entityId}`),
  });

  // Local editable form, keyed by field name. text -> string, list -> string[].
  const [form, setForm] = useState<Record<string, string | string[]>>({});

  // Reset the form whenever the entity, language, or loaded data changes.
  useEffect(() => {
    if (!detail.data) return;
    const tr = detail.data.translations[lang] ?? {};
    const next: Record<string, string | string[]> = {};
    for (const f of detail.data.fields) {
      if (f.type === "list") {
        const src = Array.isArray(detail.data.source[f.name]) ? (detail.data.source[f.name] as string[]) : [];
        const cur = Array.isArray(tr[f.name]) ? (tr[f.name] as string[]) : [];
        next[f.name] = src.map((_, i) => cur[i] ?? "");
      } else {
        next[f.name] = typeof tr[f.name] === "string" ? (tr[f.name] as string) : "";
      }
    }
    setForm(next);
  }, [detail.data, lang]);

  const save = useMutation({
    mutationFn: () => apiPut(`/admin/translations/${entityType}/${entityId}`, { lang, fields: form }),
    onSuccess: async () => {
      toast.success(`Saved ${LANGS.find((l) => l.code === lang)?.label} translation.`);
      await qc.invalidateQueries({ queryKey: ["admin", "tr-detail", entityType, entityId] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save."),
  });

  const filledCount = useMemo(() => {
    let n = 0;
    for (const v of Object.values(form)) {
      if (Array.isArray(v)) { if (v.some((s) => s.trim())) n++; }
      else if (v.trim()) n++;
    }
    return n;
  }, [form]);

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6">
        <h1 className="text-2xl">Translations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill Bemba and Nyanja for course and lesson content. Anything left blank shows the English version. Edits go live immediately.
        </p>
      </header>

      {targets.isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          <div className="grid gap-4 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-semibold">Course</span>
              <select name="course" value={courseId} onChange={(e) => setCourseId(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-input bg-background px-3">
                {targets.data?.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-semibold">What to translate</span>
              <select name="item" value={sel} onChange={(e) => setSel(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-input bg-background px-3">
                <option value="course">Course overview (title, tagline, description, outcomes)</option>
                {course?.lessons.map((l) => <option key={l.id} value={l.id}>Lesson: {l.title}</option>)}
              </select>
            </label>
          </div>

          <div className="mt-5 flex items-center gap-2">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={cn("rounded-full border px-4 py-2 text-sm font-semibold", lang === l.code ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary")}
              >
                {l.label}
              </button>
            ))}
            <span className="ml-auto text-xs text-muted-foreground">{filledCount} field(s) translated</span>
          </div>

          {detail.isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
          ) : detail.data ? (
            <form
              onSubmit={(e) => { e.preventDefault(); save.mutate(); }}
              className="mt-4 space-y-6"
            >
              {detail.data.fields.map((f) => (
                <FieldEditor
                  key={f.name}
                  field={f}
                  source={detail.data!.source[f.name]}
                  value={form[f.name] ?? (f.type === "list" ? [] : "")}
                  onChange={(v) => setForm((s) => ({ ...s, [f.name]: v }))}
                />
              ))}
              <div className="sticky bottom-4 flex items-center gap-3 rounded-xl border border-border bg-card/95 p-3 shadow-sm backdrop-blur">
                <Button type="submit" disabled={save.isPending}>
                  {save.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Save {LANGS.find((l) => l.code === lang)?.label}
                </Button>
                <span className="text-xs text-muted-foreground">Blank fields fall back to English.</span>
              </div>
            </form>
          ) : null}
        </>
      )}
    </div>
  );
}

function FieldEditor({ field, source, value, onChange }: {
  field: FieldSpec;
  source: unknown;
  value: string | string[];
  onChange: (v: string | string[]) => void;
}) {
  const srcText = typeof source === "string" ? source : "";
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="mb-2 font-semibold">{field.label}</p>
      {field.type === "list" ? (
        <div className="space-y-3">
          {(Array.isArray(source) ? (source as string[]) : []).map((srcItem, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-2">
              <p className="rounded-lg bg-secondary/50 px-3 py-2 text-sm text-muted-foreground">{srcItem}</p>
              <Input
                value={(value as string[])[i] ?? ""}
                onChange={(e) => {
                  const arr = [...(value as string[])];
                  arr[i] = e.target.value;
                  onChange(arr);
                }}
                name="translation" placeholder="Translation…"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          <p className={cn("whitespace-pre-wrap rounded-lg bg-secondary/50 px-3 py-2 text-sm text-muted-foreground", field.type === "longtext" && "min-h-40")}>{srcText}</p>
          {field.type === "longtext" ? (
            <Textarea value={value as string} onChange={(e) => onChange(e.target.value)} rows={10} name="translation" placeholder="Translation…" />
          ) : (
            <Input value={value as string} onChange={(e) => onChange(e.target.value)} name="translation" placeholder="Translation…" />
          )}
        </div>
      )}
    </div>
  );
}
