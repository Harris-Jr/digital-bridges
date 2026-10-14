import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SiteLayout, CourseCard, CardsSkeleton, ErrorNote, EmptyState, PageHero } from "@/components/site";
import { useCategories, useMyProgress, usePublishedCourses } from "@/lib/content";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/courses/")({
  head: () => ({
    meta: [
      { title: "Courses — Digital Bridges" },
      { name: "description", content: "Eight free courses: phone basics, online safety, mobile money, spotting false news, work skills and selling online." },
      { property: "og:title", content: "Courses — Digital Bridges" },
      { property: "og:description", content: "Eight free digital skills courses in simple language." },
    ],
  }),
  component: CoursesPage,
});

function CoursesPage() {
  const { user } = useAuth();
  const courses = usePublishedCourses();
  const cats = useCategories();
  const progress = useMyProgress(user?.id);
  const [cat, setCat] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const done = new Set(progress.data?.map((p) => p.lesson_id));
  const list = useMemo(
    () =>
      (courses.data ?? []).filter(
        (c) =>
          (!cat || c.category_id === cat) &&
          (!q || (c.title + c.tagline).toLowerCase().includes(q.toLowerCase())),
      ),
    [courses.data, cat, q],
  );

  return (
    <SiteLayout>
      <PageHero eyebrow="Courses" title="Pick what you want to learn" sub="Every course is free, short and written in plain language. If you are new to phones, begin with course 1." />
      <section className="container-page">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div role="group" aria-label="Filter by topic" className="flex flex-wrap gap-2">
            <Pill active={!cat} onClick={() => setCat(null)}>All</Pill>
            {cats.data?.map((c) => (
              <Pill key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>{c.name}</Pill>
            ))}
          </div>
          <label className="relative block md:w-72">
            <span className="sr-only">Search courses</span>
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search courses" className="h-11 rounded-full bg-card pl-10" />
          </label>
        </div>
        <div className="mt-8">
          {courses.isLoading ? <CardsSkeleton n={8} /> : courses.isError ? <ErrorNote /> : list.length === 0 ? (
            <EmptyState icon="SearchX" title="No courses match" body="Try a different word, or show all topics." action={<Button variant="outline" onClick={() => { setQ(""); setCat(null); }}>Show all courses</Button>} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {list.map((c) => {
                const total = c.lessons?.length ?? 0;
                const d = c.lessons?.filter((l) => done.has(l.id)).length ?? 0;
                const idx = (courses.data ?? []).findIndex((x) => x.id === c.id);
                return <CourseCard key={c.id} course={c} index={idx} progress={user && total ? Math.round((d / total) * 100) : undefined} />;
              })}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn("min-h-11 rounded-full border px-4 text-sm font-semibold", active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary")}
    >
      {children}
    </button>
  );
}
