import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdminHeader } from "@/components/admin";
import { apiGet, apiPatch } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/workshops")({
  component: Workshops,
});

type Request = {
  id: string;
  topic: string;
  date: string;
  venue: string;
  expected_learners: number;
  status: "pending" | "approved" | "declined";
  trainer_name: string;
  trainer_email: string;
};

const FILTERS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "declined", label: "Declined" },
  { key: "all", label: "All" },
] as const;

function Workshops() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("pending");
  const q = useQuery({
    queryKey: ["admin", "workshop-requests", filter],
    queryFn: () => apiGet<Request[]>(`/admin/workshop-requests${filter === "all" ? "" : `?status=${filter}`}`),
  });
  const decide = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "declined" }) => apiPatch(`/admin/workshop-requests/${id}`, { status }),
    onSuccess: (_d, v) => { toast.success(v.status === "approved" ? "Workshop approved." : "Workshop declined."); qc.invalidateQueries({ queryKey: ["admin", "workshop-requests"] }); },
    onError: () => toast.error("Could not update that request."),
  });

  const badge = (s: Request["status"]) =>
    cn("rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
      s === "approved" && "bg-primary-soft text-success",
      s === "declined" && "bg-destructive/10 text-destructive",
      s === "pending" && "bg-warning/15 text-warning");

  return (
    <div>
      <AdminHeader title="Workshop requests" description="Approve or decline workshops facilitators have requested." />

      <div className="mb-4 inline-flex rounded-full border border-border bg-card p-1">
        {FILTERS.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={cn("min-h-9 rounded-full px-4 text-sm font-semibold", filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>{f.label}</button>
        ))}
      </div>

      {q.isLoading ? (
        <div className="grid place-items-center py-16"><Loader2 className="size-6 animate-spin text-muted-foreground" aria-label="Loading" /></div>
      ) : !q.data || q.data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">No {filter === "all" ? "" : filter} requests.</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr><th className="px-4 py-3 font-semibold">Topic</th><th className="px-4 py-3 font-semibold">Facilitator</th><th className="px-4 py-3 font-semibold">Date</th><th className="px-4 py-3 font-semibold">Venue</th><th className="px-4 py-3 font-semibold">Learners</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 text-right font-semibold">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {q.data.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium">{r.topic}</td>
                  <td className="px-4 py-3"><p>{r.trainer_name}</p><p className="text-xs text-muted-foreground">{r.trainer_email}</p></td>
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(r.date).toLocaleDateString("en-GB")}</td>
                  <td className="px-4 py-3">{r.venue}</td>
                  <td className="px-4 py-3">{r.expected_learners}</td>
                  <td className="px-4 py-3"><span className={badge(r.status)}>{r.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {r.status !== "approved" && <Button size="sm" variant="outline" disabled={decide.isPending} onClick={() => decide.mutate({ id: r.id, status: "approved" })}><Check className="size-4 text-success" />Approve</Button>}
                      {r.status !== "declined" && <Button size="sm" variant="ghost" disabled={decide.isPending} onClick={() => decide.mutate({ id: r.id, status: "declined" })}><X className="size-4 text-destructive" />Decline</Button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
