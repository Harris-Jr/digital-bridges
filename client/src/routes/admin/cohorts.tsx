import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MapPin, Users, CalendarDays, Activity, Award } from "lucide-react";
import { AdminHeader } from "@/components/admin";
import { apiGet } from "@/lib/api";

export const Route = createFileRoute("/admin/cohorts")({ component: Cohorts });

type Row = {
  id: string; name: string; location: string; created_at: string; join_code: string | null;
  facilitator: string; facilitator_email: string | null; member_count: number; session_count: number; active_30d: number; certificates: number;
};

function Cohorts() {
  const q = useQuery({ queryKey: ["admin", "cohorts"], queryFn: () => apiGet<Row[]>("/admin/cohorts") });
  const rows = q.data ?? [];
  const totals = rows.reduce((t, r) => ({ learners: t.learners + r.member_count, active: t.active + r.active_30d, sessions: t.sessions + r.session_count }), { learners: 0, active: 0, sessions: 0 });

  return (
    <>
      <AdminHeader title="Cohorts" description="Every facilitator cohort across the country, with real membership and activity." />
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Cohorts", value: rows.length },
          { label: "Learners in cohorts", value: totals.learners },
          { label: "Active in last 30 days", value: totals.active },
          { label: "Sessions held or planned", value: totals.sessions },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</p>
            <p className="mt-1 font-display text-2xl font-extrabold">{q.isLoading ? "…" : s.value}</p>
          </div>
        ))}
      </div>

      {q.isLoading ? (
        <div className="py-16 text-center"><Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" /></div>
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">No cohorts yet. Facilitators create them from the For Trainers area.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((r) => (
            <div key={r.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">{r.name}</p>
                {r.join_code && <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs font-bold text-primary">{r.join_code}</span>}
              </div>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="size-3.5" />{r.location}</p>
              <p className="mt-1 text-sm text-muted-foreground">Facilitator: <span className="text-foreground">{r.facilitator || "Unassigned"}</span></p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <span className="flex items-center gap-1.5"><Users className="size-4 text-primary" />{r.member_count} {r.member_count === 1 ? "learner" : "learners"}</span>
                <span className="flex items-center gap-1.5"><Activity className="size-4 text-success" />{r.active_30d} active (30d)</span>
                <span className="flex items-center gap-1.5"><CalendarDays className="size-4 text-primary" />{r.session_count} {r.session_count === 1 ? "session" : "sessions"}</span>
                <span className="flex items-center gap-1.5"><Award className="size-4 text-accent" />{r.certificates} {r.certificates === 1 ? "certificate" : "certificates"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
