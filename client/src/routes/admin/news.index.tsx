import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Eye, EyeOff, Newspaper } from "lucide-react";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiGet, apiPost } from "@/lib/api";
import { slugify } from "@/lib/admin-course";

export const Route = createFileRoute("/admin/news/")({ component: NewsList });

export type Post = {
  id: string; slug: string; title: string; excerpt: string; body: string; cover_url: string | null; cover_alt: string;
  tags: string[]; author_name: string; status: "draft" | "published"; published_at: string | null; updated_at: string;
};

function NewsList() {
  const navigate = useNavigate();
  const list = useQuery({ queryKey: ["admin", "posts"], queryFn: () => apiGet<Post[]>("/admin/posts") });
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const create = useMutation({
    mutationFn: async () => {
      const taken = new Set((list.data ?? []).map((p) => p.slug));
      let slug = slugify(title), n = 2;
      while (taken.has(slug)) slug = `${slugify(title)}-${n++}`;
      return apiPost<Post>("/admin/posts", { title: title.trim(), slug, status: "draft" });
    },
    onSuccess: (p) => navigate({ to: "/admin/news/$postId", params: { postId: p.id } }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not create the post."),
  });

  return (
    <>
      <AdminHeader title="News" description="Stories, updates and announcements shown on the public News page." action={<Button onClick={() => { setTitle(""); setOpen(true); }}><Plus className="size-4" />New post</Button>} />
      {list.isLoading ? (
        <div className="py-16 text-center"><Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" /></div>
      ) : (list.data?.length ?? 0) === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <Newspaper className="mx-auto size-8 text-primary" />
          <p className="mt-3 font-semibold">No posts yet</p>
          <p className="mt-1 text-sm text-muted-foreground">The News link appears in the site menu once the first post is published.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {list.data!.map((p) => (
            <li key={p.id}>
              <Link to="/admin/news/$postId" params={{ postId: p.id }} className="flex gap-4 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary">
                <div className="hidden h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-secondary sm:block">
                  {p.cover_url && <img src={p.cover_url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{p.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{p.excerpt || "No summary yet"}</p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                    <span className={p.status === "published" ? "inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 font-semibold text-success" : "inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-semibold text-muted-foreground"}>
                      {p.status === "published" ? <Eye className="size-3" /> : <EyeOff className="size-3" />}{p.status === "published" ? "Published" : "Draft"}
                    </span>
                    {p.published_at && <span className="text-muted-foreground">{new Date(p.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>}
                    {p.tags.map((t) => <span key={t} className="rounded-full bg-secondary px-2 py-0.5">{t}</span>)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New post</DialogTitle></DialogHeader>
          <form id="np" onSubmit={(e) => { e.preventDefault(); if (title.trim()) create.mutate(); }}>
            <Input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" className="h-11" />
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" form="np" disabled={!title.trim() || create.isPending}>Create and edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
