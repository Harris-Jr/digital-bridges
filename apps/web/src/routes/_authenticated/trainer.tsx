import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, MapPin, Users, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteLayout, PageHero, EmptyState } from "@/components/site";
import { useAuth } from "@/lib/auth";
import { usePage } from "@/lib/content";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/trainer")({
  head: () => ({
    meta: [
      { title: "For Trainers — Digital Bridges" },
      { name: "description", content: "Guides, posters and workshop planning for community facilitators in Zambia." },
      { property: "og:title", content: "For Trainers — Digital Bridges" },
      { property: "og:description", content: "Run digital skills workshops in your community." },
    ],
  }),
  component: Trainer,
});

function Trainer() {
  const { user, isTrainer, refresh } = useAuth();
  const page = usePage("trainers");
  const qc = useQueryClient();
  const groups = useQuery({
    queryKey: ["groups"],
    enabled: isTrainer,
    queryFn: async () => (await supabase.from("community_groups").select("*").order("name")).data ?? [],
  });
  const resources = useQuery({
    queryKey: ["resources", "trainer"],
    queryFn: async () => (await supabase.from("resources").select("*").eq("is_published", true).eq("audience", "trainer").order("title")).data ?? [],
  });
  const requests = useQuery({
    queryKey: ["my-workshops", user?.id],
    enabled: isTrainer,
    queryFn: async () => (await supabase.from("workshop_requests").select("*").eq("trainer_id", user!.id).order("date")).data ?? [],
  });
  const [f, setF] = useState({ topic: "", date: "", venue: "", expected_learners: "15" });
  const [err, setErr] = useState("");
  const submit = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("workshop_requests").insert({
        trainer_id: user!.id,
        topic: f.topic.trim(),
        date: f.date,
        venue: f.venue.trim(),
        expected_learners: Number(f.expected_learners) || 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Workshop request sent. We will let you know when it is approved.");
      setF({ topic: "", date: "", venue: "", expected_learners: "15" });
      qc.invalidateQueries({ queryKey: ["my-workshops"] });
    },
    onError: () => toast.error("We could not send that. Please try again."),
  });

  const become = async () => {
    const { error } = await supabase.rpc("request_trainer_role");
    if (error) { toast.error("Something went wrong. Please try again."); return; }
    await refresh();
    toast.success("You are now set up as a facilitator.");
  };

  return (
    <SiteLayout>
      <PageHero eyebrow="For trainers" title={page.data?.hero_title ?? "Run workshops in your community"} sub={page.data?.hero_subline} />
      <div className="container-page space-y-12">
        {!isTrainer ? (
          <EmptyState icon="Megaphone" title="Become a community facilitator" body="Facilitators can see community groups, download teaching materials and plan workshops. It is free." action={<Button onClick={become}>Set me up as a facilitator</Button>} />
        ) : (
          <>
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
    </SiteLayout>
  );
}
