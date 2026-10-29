import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, MapPin, Users, FileText, Plus, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHero, EmptyState } from "@/components/site";
import { useAuth } from "@/lib/auth";
import { usePage } from "@/lib/content";
import { apiGet, apiPost } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/trainer")({
  head: () => ({
    meta: [
      { title: "For Trainers — Civic Wise" },
      { name: "description", content: "Guides, posters and workshop planning for community facilitators in Zambia." },
      { property: "og:title", content: "For Trainers — Civic Wise" },
      { property: "og:description", content: "Run digital skills workshops in your community." },
    ],
  }),
  component: Trainer,
});

function Trainer() {
  const { user, isTrainer, refresh } = useAuth();
  const page = usePage("trainers");
  const qc = useQueryClient();
  type Group = { id: string; name: string; location: string; learners: number; avg_completion: number };
  type Cohort = { id: string; name: string; location: string; join_code: string | null; member_count: number };
  type Resource = { id: string; title: string; type: string; file_url: string };
  type Workshop = { id: string; topic: string; date: string; venue: string; status: string };
  const cohorts = useQuery({
    queryKey: ["cohorts"],
    enabled: isTrainer,
    queryFn: () => apiGet<Cohort[]>("/trainer/cohorts"),
  });
  const [cf, setCf] = useState({ name: "", location: "" });
  const createCohort = useMutation({
    mutationFn: () => apiPost("/trainer/cohorts", { name: cf.name.trim(), location: cf.location.trim() }),
    onSuccess: () => { toast.success("Cohort created. Share the join code with your learners."); setCf({ name: "", location: "" }); qc.invalidateQueries({ queryKey: ["cohorts"] }); },
    onError: () => toast.error("Could not create that cohort. Please try again."),
  });
  const groups = useQuery({
    queryKey: ["groups"],
    enabled: isTrainer,
    queryFn: () => apiGet<Group[]>("/trainer/community-groups"),
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
          <EmptyState icon="Megaphone" title="Become a community facilitator" body="Facilitators can see community groups, download teaching materials and plan workshops. It is free." action={<Button onClick={become}>Set me up as a facilitator</Button>} />
        ) : (
          <>
            <section>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl">My cohorts</h2>
              </div>
              <p className="mt-1 text-muted-foreground">Groups of learners you run through courses. Create one, then add learners by email or share the join code.</p>

              <form
                className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
                onSubmit={(e) => { e.preventDefault(); if (cf.name.trim() && cf.location.trim()) createCohort.mutate(); }}
              >
                <div className="flex-1 min-w-48"><Label htmlFor="cname">Cohort name</Label><Input id="cname" className="mt-1 h-11" value={cf.name} onChange={(e) => setCf({ ...cf, name: e.target.value })} placeholder="For example: Mtendere Tuesday Group" /></div>
                <div className="flex-1 min-w-40"><Label htmlFor="cloc">Location</Label><Input id="cloc" className="mt-1 h-11" value={cf.location} onChange={(e) => setCf({ ...cf, location: e.target.value })} placeholder="For example: Lusaka" /></div>
                <Button type="submit" disabled={createCohort.isPending}><Plus className="size-4" />Create cohort</Button>
              </form>

              {cohorts.isLoading ? <Skeleton className="mt-4 h-28 rounded-2xl" /> : cohorts.data?.length ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {cohorts.data.map((c) => (
                    <Link key={c.id} to="/cohorts/$id" params={{ id: c.id }} className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary">
                      <h3 className="text-lg">{c.name}</h3>
                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="size-4" aria-hidden="true" />{c.location}</p>
                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><Users className="size-4" aria-hidden="true" />{c.member_count} {c.member_count === 1 ? "learner" : "learners"}</p>
                      <div className="mt-3 flex items-center justify-between">
                        {c.join_code && <span className="rounded-md bg-secondary px-2 py-1 font-display text-sm font-bold tracking-[0.15em] text-primary">{c.join_code}</span>}
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">Open<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : <div className="mt-4"><EmptyState icon="Users" title="No cohorts yet" body="Create your first cohort above to start tracking a group of learners." /></div>}
            </section>

            <section>
              <h2 className="text-2xl">Community groups</h2>
              {groups.isLoading ? <Skeleton className="mt-4 h-32 rounded-2xl" /> : groups.data?.length ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {groups.data.map((g) => (
                    <div key={g.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                      <h3 className="text-lg">{g.name}</h3>
                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="size-4" aria-hidden="true" />{g.location}</p>
                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><Users className="size-4" aria-hidden="true" />{g.learners} learners</p>
                      <div className="mt-3 h-2 rounded-full bg-secondary"><div className="h-2 rounded-full bg-success" style={{ width: `${g.avg_completion}%` }} /></div>
                      <p className="mt-1 text-xs text-muted-foreground">{g.avg_completion}% average completion</p>
                    </div>
                  ))}
                </div>
              ) : <div className="mt-4"><EmptyState icon="Users" title="No groups yet" body="Groups you work with will appear here once an editor adds them." /></div>}
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
                  <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
                    {resources.data.map((r) => (
                      <li key={r.id} className="flex items-center gap-3 px-5 py-3">
                        <FileText className="size-5 text-primary" aria-hidden="true" />
                        <span className="flex-1">{r.title} <span className="text-xs uppercase text-muted-foreground">{r.type}</span></span>
                        <Button asChild variant="ghost" size="icon" aria-label={`Download ${r.title}`}><a href={r.file_url} target="_blank" rel="noreferrer"><Download /></a></Button>
                      </li>
                    ))}
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
