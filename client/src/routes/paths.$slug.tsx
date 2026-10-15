import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteLayout, Icon, CourseCard, CardsSkeleton, ErrorNote, EmptyState } from "@/components/site";
import { usePathway } from "@/lib/content";

export const Route = createFileRoute("/paths/$slug")({
  component: PathwayPage,
});

function PathwayPage() {
  const { slug } = Route.useParams();
  const q = usePathway(slug);
  const pathway = q.data?.pathway;
  const courses = q.data?.courses ?? [];

  return (
    <SiteLayout>
      <section className="border-b border-border bg-secondary/40">
        <div className="container-page py-12 md:py-16">
          <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            <ArrowLeft className="size-4" />All paths
          </Link>
          {pathway && (
            <div className="mt-6 flex items-start gap-5">
              <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
                <Icon name={pathway.icon_name} className="size-8" />
              </span>
              <div>
                <h1 className="text-3xl md:text-5xl">{pathway.title}</h1>
                <p className="mt-2 max-w-2xl text-lg text-muted-foreground">{pathway.description || pathway.subtitle}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="container-page py-12">
        {q.isLoading ? (
          <CardsSkeleton />
        ) : q.isError ? (
          <ErrorNote />
        ) : courses.length === 0 ? (
          <EmptyState icon="BookOpen" title="Courses coming soon" body="This path does not have any courses yet. Check back soon." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {courses.map((c, i) => <CourseCard key={c.id} course={c} index={i} />)}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
