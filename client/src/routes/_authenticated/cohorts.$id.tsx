import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Users, Copy, Check, UserPlus, Trash2, CalendarPlus, ClipboardCheck, Award, BookOpenCheck, BookOpen, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/site";
import { getToken, apiGet, apiPost, apiDelete, apiPatch } from "@/lib/api";
import { usePublishedCourses } from "@/lib/content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/cohorts/$id")({
  beforeLoad: () => {
    if (!getToken()) throw redirect({ to: "/signin" });
  },
  component: CohortDetail,
});

type Member = { user_id: string; name: string; email: string; lessons_completed: number; certificates: number; completion: number; last_active: string | null };
type Session = { id: string; title: string; session_date: string };
type Detail = {
  cohort: { id: string; name: string; join_code: string | null; location: string; description: string; course_ids: string[] };
  members: Member[];
  sessions: (Session & { present_count: number })[];
};
type Roster = { user_id: string; name: string; present: boolean };

function CohortDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["cohort", id], queryFn: () => apiGet<Detail>(`/trainer/cohorts/${id}`) });
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [sess, setSess] = useState({ title: "", session_date: "" });
  const [openSession, setOpenSession] = useState<string | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["cohort", id] });

  const addMember = useMutation({
    mutationFn: () => apiPost(`/trainer/cohorts/${id}/members`, { email: email.trim() }),
    onSuccess: () => { toast.success("Learner added to the cohort."); setEmail(""); invalidate(); },
    onError: (e: Error) => toast.error(e.message || "Could not add that learner."),
  });
  const removeMember = useMutation({
    mutationFn: (userId: string) => apiDelete(`/trainer/cohorts/${id}/members/${userId}`),
    onSuccess: () => { toast.success("Learner removed."); invalidate(); },
    onError: () => toast.error("Could not remove that learner."),
  });
  const addSession = useMutation({
    mutationFn: () => apiPost(`/trainer/cohorts/${id}/sessions`, { title: sess.title.trim(), session_date: sess.session_date }),
    onSuccess: () => { toast.success("Session added."); setSess({ title: "", session_date: "" }); invalidate(); },
    onError: () => toast.error("Could not add that session."),
  });

  if (q.isLoading) return <><div className="container-page space-y-4 py-12"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-40 w-full rounded-2xl" /></div></>;
  if (q.isError || !q.data)
    return (
      <>
        <div className="container-page py-16">
          <EmptyState icon="Users" title="Cohort not found" body="It may have been removed, or it belongs to another facilitator." action={<Button asChild><Link to="/trainer"><ArrowLeft />Back to trainer area</Link></Button>} />
        </div>
      </>
    );

  const { cohort, members, sessions } = q.data;
  const copyCode = async () => {
    if (!cohort.join_code) return;
    try { await navigator.clipboard.writeText(cohort.join_code); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard may be blocked */ }
  };

  return (
    <>
      <section className="container-page py-10">
        <Button asChild variant="ghost" size="sm" className="mb-4"><Link to="/trainer"><ArrowLeft className="size-4" />Back to trainer area</Link></Button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Cohort</p>
            <h1 className="mt-1 text-3xl">{cohort.name}</h1>
            <p className="mt-1 flex items-center gap-1 text-muted-foreground"><Users className="size-4" aria-hidden="true" />{members.length} {members.length === 1 ? "learner" : "learners"}</p>
          </div>
          {cohort.join_code && (
            <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Join code</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="font-display text-2xl font-extrabold tracking-[0.2em] text-primary">{cohort.join_code}</span>
                <Button variant="ghost" size="icon" aria-label="Copy join code" onClick={copyCode}>{copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}</Button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Learners enter this to join</p>
            </div>
          )}
        </div>

        <CohortCourses cohortId={cohort.id} selected={cohort.course_ids ?? []} onSaved={invalidate} />

        {/* Members + progress */}
        <div className="mt-10">
          <h2 className="text-2xl">Learners &amp; progress</h2>
          <form
            className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
            onSubmit={(e) => { e.preventDefault(); if (email.trim()) addMember.mutate(); }}
          >
            <div className="flex-1 min-w-56"><Label htmlFor="email">Add a learner by email</Label><Input id="email" type="email" className="mt-1 h-11" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="learner@example.com" /></div>
            <Button type="submit" disabled={addMember.isPending}><UserPlus className="size-4" />Add</Button>
          </form>

          {members.length === 0 ? (
            <div className="mt-4"><EmptyState icon="Users" title="No learners yet" body="Add learners by email, or share the join code above." /></div>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-secondary/40 text-left">
                  <tr><th className="px-4 py-3 font-semibold">Learner</th><th className="px-4 py-3 font-semibold">Progress</th><th className="hidden px-4 py-3 font-semibold sm:table-cell">Lessons</th><th className="hidden px-4 py-3 font-semibold sm:table-cell">Certificates</th><th className="hidden px-4 py-3 font-semibold md:table-cell">Last active</th><th className="px-4 py-3" /></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {members.map((m) => (
                    <tr key={m.user_id}>
                      <td className="px-4 py-3"><p className="font-medium">{m.name}</p><p className="text-xs text-muted-foreground">{m.email}</p></td>
                      <td className="px-4 py-3">
                        <div className="flex min-w-24 items-center gap-2">
                          <div className="h-2 flex-1 rounded-full bg-secondary"><div className="h-2 rounded-full bg-success" style={{ width: `${m.completion}%` }} /></div>
                          <span className="w-9 text-right text-xs font-semibold">{m.completion}%</span>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell"><span className="inline-flex items-center gap-1"><BookOpenCheck className="size-4 text-success" aria-hidden="true" />{m.lessons_completed}</span></td>
                      <td className="hidden px-4 py-3 sm:table-cell"><span className="inline-flex items-center gap-1"><Award className="size-4 text-accent" aria-hidden="true" />{m.certificates}</span></td>
                      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{m.last_active ? new Date(m.last_active).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "Not yet"}</td>
                      <td className="px-4 py-3 text-right"><Button variant="ghost" size="icon" aria-label={`Remove ${m.name}`} onClick={() => removeMember.mutate(m.user_id)}><Trash2 className="size-4 text-destructive" /></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sessions + attendance */}
        <div className="mt-10">
          <h2 className="text-2xl">Workshop sessions</h2>
          <form
            className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
            onSubmit={(e) => { e.preventDefault(); if (sess.title.trim() && sess.session_date) addSession.mutate(); }}
          >
            <div className="flex-1 min-w-56"><Label htmlFor="stitle">Session title</Label><Input id="stitle" className="mt-1 h-11" value={sess.title} onChange={(e) => setSess({ ...sess, title: e.target.value })} placeholder="For example: Week 1, Passwords" /></div>
            <div><Label htmlFor="sdate">Date</Label><Input id="sdate" type="date" className="mt-1 h-11" value={sess.session_date} onChange={(e) => setSess({ ...sess, session_date: e.target.value })} /></div>
            <Button type="submit" disabled={addSession.isPending}><CalendarPlus className="size-4" />Add session</Button>
          </form>

          {sessions.length === 0 ? (
            <div className="mt-4"><EmptyState icon="CalendarDays" title="No sessions yet" body="Add a session, then mark who attended." /></div>
          ) : (
            <ul className="mt-4 space-y-3">
              {sessions.map((s) => (
                <li key={s.id} className="rounded-2xl border border-border bg-card shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div>
                      <p className="font-semibold">{s.title}</p>
                      <p className="text-sm text-muted-foreground">{new Date(s.session_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} · {s.present_count} present</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setOpenSession(openSession === s.id ? null : s.id)}><ClipboardCheck className="size-4" />{openSession === s.id ? "Close" : "Mark attendance"}</Button>
                  </div>
                  {openSession === s.id && <AttendancePanel sessionId={s.id} onSaved={() => { setOpenSession(null); invalidate(); }} />}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}

function AttendancePanel({ sessionId, onSaved }: { sessionId: string; onSaved: () => void }) {
  const q = useQuery({ queryKey: ["attendance", sessionId], queryFn: () => apiGet<Roster[]>(`/trainer/sessions/${sessionId}/attendance`) });
  const [marks, setMarks] = useState<Record<string, boolean> | null>(null);
  const state = marks ?? Object.fromEntries((q.data ?? []).map((r) => [r.user_id, r.present]));
  const save = useMutation({
    mutationFn: () => apiPost(`/trainer/sessions/${sessionId}/attendance`, { entries: Object.entries(state).map(([user_id, present]) => ({ user_id, present })) }),
    onSuccess: () => { toast.success("Attendance saved."); onSaved(); },
    onError: () => toast.error("Could not save attendance."),
  });

  if (q.isLoading) return <div className="border-t border-border p-4"><Skeleton className="h-20 w-full" /></div>;
  if (!q.data || q.data.length === 0) return <div className="border-t border-border p-4 text-sm text-muted-foreground">Add learners to the cohort first, then mark attendance.</div>;

  return (
    <div className="border-t border-border p-4">
      <ul className="divide-y divide-border">
        {q.data.map((r) => (
          <li key={r.user_id} className="flex items-center justify-between py-2.5">
            <span className="font-medium">{r.name}</span>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{state[r.user_id] ? "Present" : "Absent"}</span>
              <Switch checked={!!state[r.user_id]} onCheckedChange={(v) => setMarks({ ...state, [r.user_id]: v })} aria-label={`${r.name} present`} />
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex justify-end"><Button size="sm" onClick={() => save.mutate()} disabled={save.isPending}>Save attendance</Button></div>
    </div>
  );
}

function CohortCourses({ cohortId, selected, onSaved }: { cohortId: string; selected: string[]; onSaved: () => void }) {
  const courses = usePublishedCourses();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [ids, setIds] = useState<string[]>(selected);
  const save = useMutation({
    mutationFn: () => apiPatch(`/trainer/cohorts/${cohortId}`, { course_ids: ids }),
    onSuccess: () => { toast.success("Courses updated. Progress is now measured on these."); setEditing(false); onSaved(); qc.invalidateQueries({ queryKey: ["cohorts"] }); },
    onError: () => toast.error("Could not update the courses."),
  });
  const titles = (courses.data ?? []).filter((c) => selected.includes(c.id)).map((c) => c.title);

  return (
    <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 font-semibold"><BookOpen className="size-4 text-primary" />Courses this cohort follows</p>
          <p className="mt-1 text-sm text-muted-foreground">{titles.length ? titles.join(", ") : "All courses. Choose specific courses to measure progress on them only."}</p>
        </div>
        {!editing && <Button variant="outline" size="sm" onClick={() => { setIds(selected); setEditing(true); }}><Pencil className="size-4" />Change</Button>}
      </div>
      {editing && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {courses.data?.map((c) => {
              const on = ids.includes(c.id);
              return (
                <button key={c.id} type="button" aria-pressed={on} onClick={() => setIds((s) => (on ? s.filter((x) => x !== c.id) : [...s, c.id]))}
                  className={cn("min-h-9 rounded-full border px-3 text-xs font-semibold transition-colors", on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary")}>
                  {c.title}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending}>Save courses</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}
