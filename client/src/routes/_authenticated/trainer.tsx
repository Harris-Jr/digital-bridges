import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, MapPin, Users, FileText, Plus, ArrowRight, Activity, CalendarDays, TrendingUp, ExternalLink, Presentation, Image as ImageIcon, Video, Link2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHero, EmptyState } from "@/components/site";
import { useAuth } from "@/lib/auth";
import { usePage, usePublishedCourses } from "@/lib/content";
import { cn } from "@/lib/utils";
import { apiGet, apiPost } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/trainer")({
  head: () => ({
    meta: [
      { title: "For Trainers, Civic Wise" },
      { name: "description", content: "Guides, posters and workshop planning for community facilitators in Zambia." },
      { property: "og:title", content: "For Trainers, Civic Wise" },
      { property: "og:description", content: "Run digital skills workshops in your community." },
    ],
  }),
  component: Trainer,
});

function Trainer() {
  const { user, isTrainer, refresh } = useAuth();
  const page = usePage("trainers");
  const qc = useQueryClient();
  type Cohort = {
    id: string; name: string; location: string; join_code: string | null; member_count: number;
    avg_completion: number; active_7d: number; session_count: number; next_session: string | null; course_titles: string[];
  };
  type Resource = { id: string; title: string; description: string; type: string; file_url: string };
  type Workshop = { id: string; topic: string; date: string; venue: string; status: string };
  const cohorts = useQuery({
    queryKey: ["cohorts"],
    enabled: isTrainer,
    queryFn: () => apiGet<Cohort[]>("/trainer/cohorts"),
  });
  const [cf, setCf] = useState({ name: "", location: "" });
  const [courseIds, setCourseIds] = useState<string[]>([]);
  const allCourses = usePublishedCourses();
  const createCohort = useMutation({
    mutationFn: () => apiPost("/trainer/cohorts", { name: cf.name.trim(), location: cf.location.trim(), course_ids: courseIds }),
    onSuccess: () => { toast.success("Cohort created. Share the join code with your learners."); setCf({ name: "", location: "" }); setCourseIds([]); qc.invalidateQueries({ queryKey: ["cohorts"] }); },
    onError: () => toast.error("Could not create that cohort. Please try again."),
  });
  const resources = useQuery({
    queryKey: ["resources", "trainer"],
    queryFn: () => apiGet<Resource[]>("/trainer/resources?audience=trainer"),
  });
  const requests = useQuery({
    queryKey: ["my-workshops", user?.id],
    enabled: isTrainer,
    queryFn: () => apiGet<Workshop[]>("/trainer/workshops"),
  });
  const [f, setF] = useState({ topic: "", date: "", venue: "", expected_learners: "15" });
  const [err, setErr] = useState("");
  const submit = useMutation({
    mutationFn: async () => {
      await apiPost("/trainer/workshops", {
        topic: f.topic.trim(),
        date: f.date,
        venue: f.venue.trim(),
        expected_learners: Number(f.expected_learners) || 0,
      });
    },
    onSuccess: () => {
      toast.success("Workshop request sent. We will let you know when it is approved.");
      setF({ topic: "", date: "", venue: "", expected_learners: "15" });
      qc.invalidateQueries({ queryKey: ["my-workshops"] });
    },
    onError: () => toast.error("We could not send that. Please try again."),
  });

  const become = async () => {
    try {
      await apiPost("/auth/request-trainer");
      await refresh();
      toast.success("You are now set up as a facilitator.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <PageHero eyebrow="For trainers" title={page.data?.hero_title ?? "Run workshops in your community"} sub={page.data?.hero_subline} />
      <div className="container-page space-y-12">
        {!isTrainer ? (
          <EmptyState icon="Megaphone" title="Become a community facilitator" body="Facilitators run cohorts of learners, track their progress, download teaching materials and plan workshops. It is free." action={<Button onClick={become}>Set me up as a facilitator</Button>} />
        ) : (
          <>
            <section>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl">My cohorts</h2>
              </div>
              <p className="mt-1 text-muted-foreground">Groups of learners you run through courses. Create one, then add learners by email or share the join code.</p>

              {/* Overview across all cohorts */}
              {cohorts.data && cohorts.data.length > 0 && (() => {
                const list = cohorts.data;
                const learners = list.reduce((n, c) => n + c.member_count, 0);
                const active = list.reduce((n, c) => n + c.active_7d, 0);
                const weighted = learners ? Math.round(list.reduce((n, c) => n + c.avg_completion * c.member_count, 0) / learners) : 0;
                const upcoming = list.filter((c) => c.next_session).length;
                return (
                  <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {[
                      { icon: Users, label: "Learners", value: learners },
                      { icon: Activity, label: "Active this week", value: active },
                      { icon: TrendingUp, label: "Average progress", value: `${weighted}%` },
                      { icon: CalendarDays, label: "Cohorts with a session coming", value: upcoming },
                    ].map((s) => (
                      <div key={s.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                        <s.icon className="size-5 text-primary" aria-hidden="true" />
                        <p className="mt-2 font-display text-2xl font-extrabold">{s.value}</p>
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>
                );
              })()}

              <form
                className="mt-4 space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
                onSubmit={(e) => { e.preventDefault(); if (cf.name.trim() && cf.location.trim()) createCohort.mutate(); }}
              >
                <p className="font-semibold">Create a cohort</p>
                <div className="flex flex-wrap items-end gap-3">
                  <div className="min-w-48 flex-1"><Label htmlFor="cname">Cohort name</Label><Input id="cname" className="mt-1 h-11" value={cf.name} onChange={(e) => setCf({ ...cf, name: e.target.value })} placeholder="For example: Mtendere Tuesday Group" /></div>
                  <div className="min-w-40 flex-1"><Label htmlFor="cloc">Location</Label><Input id="cloc" className="mt-1 h-11" value={cf.location} onChange={(e) => setCf({ ...cf, location: e.target.value })} placeholder="For example: Lusaka" /></div>
                </div>
                <fieldset>
                  <legend className="text-sm font-medium">Courses this cohort will follow <span className="font-normal text-muted-foreground">(optional; progress is measured on these)</span></legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {allCourses.data?.map((c) => {
                      const on = courseIds.includes(c.id);
                      return (
                        <button key={c.id} type="button" aria-pressed={on}
                          onClick={() => setCourseIds((s) => (on ? s.filter((x) => x !== c.id) : [...s, c.id]))}
                          className={cn("min-h-9 rounded-full border px-3 text-xs font-semibold transition-colors", on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary")}>
                          {c.title}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
                <Button type="submit" disabled={createCohort.isPending || !cf.name.trim() || !cf.location.trim()}><Plus className="size-4" />Create cohort</Button>
              </form>

              {cohorts.isLoading ? <Skeleton className="mt-4 h-28 rounded-2xl" /> : cohorts.data?.length ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {cohorts.data.map((c) => (
                    <Link key={c.id} to="/cohorts/$id" params={{ id: c.id }} className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-lg">{c.name}</h3>
                        {c.join_code && <span className="shrink-0 rounded-md bg-secondary px-2 py-1 font-display text-xs font-bold tracking-[0.15em] text-primary">{c.join_code}</span>}
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="size-4" aria-hidden="true" />{c.location}</p>
                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><BookOpen className="size-4" aria-hidden="true" />{c.course_titles.length ? c.course_titles.join(", ") : "All courses"}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-secondary"><div className="h-2 rounded-full bg-success" style={{ width: `${c.avg_completion}%` }} /></div>
                        <span className="text-xs font-semibold text-muted-foreground">{c.avg_completion}%</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Users className="size-3.5" />{c.member_count} {c.member_count === 1 ? "learner" : "learners"}</span>
                        <span className="inline-flex items-center gap-1"><Activity className="size-3.5" />{c.active_7d} active this week</span>
                        {c.next_session && <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" />Next: {new Date(c.next_session).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>}
                      </div>
                      <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-semibold text-primary">Open cohort<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></span>
                    </Link>
                  ))}
                </div>
              ) : <div className="mt-4"><EmptyState icon="Users" title="No cohorts yet" body="Create your first cohort above. Learners join with the code, and you see their progress here." /></div>}
            </section>

            <section className="grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="text-2xl">Plan a workshop</h2>
                <form
                  className="mt-4 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!f.topic.trim() || !f.date || !f.venue.trim()) { setErr("Please fill in the topic, date and venue."); return; }
                    setErr("");
                    submit.mutate();
                  }}
                >
                  <div><Label htmlFor="topic">Topic</Label><Input id="topic" className="mt-1 h-11" value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })} placeholder="For example: Mobile money safety" /></div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><Label htmlFor="date">Date</Label><Input id="date" type="date" className="mt-1 h-11" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></div>
                    <div><Label htmlFor="exp">Expected learners</Label><Input id="exp" type="number" min={1} className="mt-1 h-11" value={f.expected_learners} onChange={(e) => setF({ ...f, expected_learners: e.target.value })} /></div>
                  </div>
                  <div><Label htmlFor="venue">Venue</Label><Input id="venue" className="mt-1 h-11" value={f.venue} onChange={(e) => setF({ ...f, venue: e.target.value })} placeholder="For example: Mtendere Community Hall, Lusaka" /></div>
                  {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
                  <Button type="submit" disabled={submit.isPending}>Send request</Button>
                </form>
                {requests.data && requests.data.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {requests.data.map((r) => (
                      <li key={r.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm">
                        <span><strong>{r.topic}</strong> · {new Date(r.date).toLocaleDateString("en-GB")} · {r.venue}</span>
                        <span className={r.status === "approved" ? "font-semibold text-success" : r.status === "declined" ? "font-semibold text-destructive" : "font-semibold text-warning"}>{r.status}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h2 className="text-2xl">Teaching materials</h2>
                {resources.data?.length ? (
                  <ul className="mt-4 space-y-3">
                    {resources.data.map((r) => {
                      const I = r.type === "slides" ? Presentation : r.type === "image" ? ImageIcon : r.type === "video" ? Video : r.type === "link" ? Link2 : FileText;
                      const downloadable = ["pdf", "doc", "slides", "image"].includes(r.type);
                      return (
                        <li key={r.id} className="flex gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
                          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><I className="size-5" aria-hidden="true" /></span>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold leading-snug">{r.title}</p>
                            {r.description && <p className="mt-0.5 text-sm text-muted-foreground">{r.description}</p>}
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Button asChild variant="outline" size="sm"><a href={r.file_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4" />Open</a></Button>
                              {downloadable && <Button asChild size="sm"><a href={r.file_url} download><Download className="size-4" />Download {r.type === "pdf" ? "PDF" : ""}</a></Button>}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : <div className="mt-4"><EmptyState icon="FolderOpen" title="Materials coming soon" body="Facilitator guides and posters will appear here as soon as the team uploads them." /></div>}
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}
