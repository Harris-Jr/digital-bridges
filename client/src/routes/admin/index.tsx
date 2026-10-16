import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, GraduationCap, Users, CalendarClock, Mail, Loader2 } from "lucide-react";
import { apiGet } from "@/lib/api";
import { AdminHeader } from "@/components/admin";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

type Stats = {
  courses: string; published_courses: string; lessons: string;
  users: string; pending_workshops: string; unread_messages: string;
};

function Dashboard() {
  const stats = useQuery({ queryKey: ["admin", "stats"], queryFn: () => apiGet<Stats>("/admin/stats") });

  const cards = [
    { label: "Courses", value: stats.data && `${stats.data.published_courses}/${stats.data.courses} published`, icon: BookOpen, to: "/admin/courses" },
    { label: "Lessons", value: stats.data?.lessons, icon: GraduationCap, to: "/admin/courses" },
    { label: "Registered learners", value: stats.data?.users, icon: Users },
    { label: "Pending workshops", value: stats.data?.pending_workshops, icon: CalendarClock, to: "/admin/workshops" },
    { label: "Unread messages", value: stats.data?.unread_messages, icon: Mail },
  ];

  return (
    <>
      <AdminHeader title="Dashboard" description="Manage Digital Bridges content and see activity at a glance." />
      {stats.isLoading ? (
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => {
            const body = (
              <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-sm">
                <div>
                  <p className="text-sm text-muted-foreground">{c.label}</p>
                  <p className="mt-1 font-display text-2xl font-extrabold">{c.value ?? "—"}</p>
                </div>
                <c.icon className="size-6 text-primary" aria-hidden="true" />
              </div>
            );
            return c.to ? <Link key={c.label} to={c.to}>{body}</Link> : <div key={c.label}>{body}</div>;
          })}
        </div>
      )}
    </>
  );
}
