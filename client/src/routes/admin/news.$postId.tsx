import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Bold, ExternalLink, Eye, Heading2, Image as ImageIcon, Link2, List, Loader2, PenLine, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { MediaPicker, MediaUpload } from "@/components/admin";
import { RichText } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { apiDelete, apiGet, apiPatch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import type { Post } from "./news.index";

export const Route = createFileRoute("/admin/news/$postId")({ component: PostEditorPage });

function PostEditorPage() {
  const { postId } = Route.useParams();
  const q = useQuery({ queryKey: ["admin", "post", postId], queryFn: () => apiGet<Post>(`/admin/posts/${postId}`) });
  if (q.isLoading) return <div className="grid place-items-center py-24"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  if (!q.data) return <p className="py-24 text-center text-muted-foreground">Post not found.</p>;
  return <PostEditor key={q.data.id} post={q.data} />;
}

function PostEditor({ post }: { post: Post }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [f, setF] = useState({
    title: post.title, slug: post.slug, excerpt: post.excerpt, body: post.body, cover_url: post.cover_url ?? "", cover_alt: post.cover_alt,
    tags: post.tags.join(", "), author_name: post.author_name || profile?.full_name || "", published: post.status === "published",
  });
  const [dirty, setDirty] = useState(false);
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [picking, setPicking] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => { setF((s) => ({ ...s, [k]: v })); setDirty(true); };

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const words = f.body.trim() ? f.body.trim().split(/\s+/).length : 0;
  const save = useMutation({
    mutationFn: () => apiPatch(`/admin/posts/${post.id}`, {
      title: f.title.trim(), slug: f.slug.trim(), excerpt: f.excerpt.trim(), body: f.body, cover_url: f.cover_url || null, cover_alt: f.cover_alt.trim(),
      tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 10), author_name: f.author_name.trim(), status: f.published ? "published" : "draft",
    }),
    onSuccess: () => { toast.success(f.published ? "Saved and published" : "Draft saved"); setDirty(false); qc.invalidateQueries({ queryKey: ["admin", "posts"] }); qc.invalidateQueries({ queryKey: ["admin", "post", post.id] }); qc.invalidateQueries({ queryKey: ["posts"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save."),
  });
  const del = useMutation({
    mutationFn: () => apiDelete(`/admin/posts/${post.id}`),
    onSuccess: () => { toast.success("Post deleted"); qc.invalidateQueries({ queryKey: ["admin", "posts"] }); navigate({ to: "/admin/news" }); },
  });

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); save.mutate(); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  const insert = (text: string, wrapSel?: (sel: string) => string) => {
    const el = bodyRef.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b, value } = el;
    const out = wrapSel ? wrapSel(value.slice(a, b)) : text;
    const pre = a > 0 && value[a - 1] !== "\n" && !wrapSel ? "\n\n" : "";
    set("body", value.slice(0, a) + pre + out + value.slice(b));
    requestAnimationFrame(() => { el.focus(); el.selectionStart = el.selectionEnd = a + pre.length + out.length; });
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm" className="-ml-2"><Link to="/admin/news"><ArrowLeft className="size-4" />All posts</Link></Button>
        {post.status === "published" && <Button asChild variant="outline" size="sm"><a href={`/news/${post.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4" />View on site</a></Button>}
      </div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="min-w-0 flex-1 font-display text-2xl font-extrabold md:text-3xl">{f.title || "Untitled post"}</h1>
        <div role="tablist" className="inline-flex rounded-full border border-border bg-card p-1 lg:hidden">
          {(["edit", "preview"] as const).map((k) => (
            <button key={k} role="tab" aria-selected={view === k} onClick={() => setView(k)} className={cn("inline-flex min-h-9 items-center gap-1.5 rounded-full px-4 text-sm font-semibold", view === k ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
              {k === "edit" ? <PenLine className="size-4" /> : <Eye className="size-4" />}{k === "edit" ? "Edit" : "Preview"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className={cn("space-y-5", view === "preview" && "hidden lg:block")}>
          <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
            <div><Label htmlFor="t">Title</Label><Input id="t" className="mt-1 h-11" value={f.title} onChange={(e) => set("title", e.target.value)} /></div>
            <div><Label htmlFor="s">Web address</Label><div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><span>/news/</span><Input id="s" className="h-10" value={f.slug} onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} /></div></div>
            <div><Label htmlFor="e">Summary</Label><Textarea id="e" rows={2} className="mt-1" value={f.excerpt} onChange={(e) => set("excerpt", e.target.value)} placeholder="One or two sentences shown on the News page and in link previews." /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label htmlFor="tg">Tags</Label><Input id="tg" className="mt-1 h-10" value={f.tags} onChange={(e) => set("tags", e.target.value)} placeholder="Workshops, Partners" /><p className="mt-1 text-xs text-muted-foreground">Separate with commas.</p></div>
              <div><Label htmlFor="au">Author</Label><Input id="au" className="mt-1 h-10" value={f.author_name} onChange={(e) => set("author_name", e.target.value)} /></div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <Label>Cover image</Label>
            <div className="mt-2"><MediaUpload value={f.cover_url} onChange={(v) => set("cover_url", v)} kind="image" /></div>
            <Label htmlFor="ca" className="mt-3 block">Cover description (alt text)</Label>
            <Input id="ca" className="mt-1 h-10" value={f.cover_alt} onChange={(e) => set("cover_alt", e.target.value)} placeholder="What the picture shows" />
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <Label htmlFor="b">Story</Label>
              <span className="text-xs text-muted-foreground">{words} words · about {Math.max(1, Math.round(words / 180))} min read</span>
            </div>
            <div className="mb-2 flex flex-wrap gap-1">
              <Button type="button" variant="ghost" size="icon" className="size-9" title="Sub-heading" aria-label="Sub-heading" onClick={() => insert("## Sub-heading\n")}><Heading2 className="size-4" /></Button>
              <Button type="button" variant="ghost" size="icon" className="size-9" title="Bold" aria-label="Bold" onClick={() => insert("", (s) => `**${s || "bold text"}**`)}><Bold className="size-4" /></Button>
              <Button type="button" variant="ghost" size="icon" className="size-9" title="List" aria-label="List" onClick={() => insert("- First point\n- Second point\n")}><List className="size-4" /></Button>
              <Button type="button" variant="ghost" size="icon" className="size-9" title="Link" aria-label="Link" onClick={() => insert("", (s) => `[${s || "link text"}](https://)`)}><Link2 className="size-4" /></Button>
              <Button type="button" variant="outline" size="sm" className="h-9" onClick={() => setPicking(true)}><ImageIcon className="size-4" />Insert image</Button>
            </div>
            <Textarea ref={bodyRef} id="b" rows={18} className="font-mono text-sm leading-relaxed" value={f.body} onChange={(e) => set("body", e.target.value)} placeholder={"Start with the most important news in one or two sentences.\n\n## What happened\n...\n\n![Learners at the Mtendere workshop](https://...)"} />
            <p className="mt-1 text-xs text-muted-foreground">“## ” sub-heading · “- ” list · **bold** · *italic* · [text](link) · images on their own line.</p>
          </section>
        </div>

        <div className={cn(view === "edit" && "hidden lg:block")}>
          <div className="lg:sticky lg:top-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preview</p>
            <article className="max-h-[78vh] overflow-y-auto rounded-2xl border border-border bg-background">
              {f.cover_url && <img src={f.cover_url} alt={f.cover_alt} className="aspect-[16/9] w-full object-cover" />}
              <div className="p-5">
                <h2 className="font-display text-2xl font-extrabold">{f.title}</h2>
                {f.excerpt && <p className="mt-2 text-muted-foreground">{f.excerpt}</p>}
                <div className="mt-4 text-[15px]">{f.body.trim() ? <RichText text={f.body} /> : <p className="text-muted-foreground">The story shows here.</p>}</div>
              </div>
            </article>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-30 -mx-4 mt-6 border-t border-border bg-card/95 backdrop-blur md:-mx-8">
        <div className="flex flex-wrap items-center justify-end gap-3 px-4 py-3 md:px-8">
          <Button variant="ghost" className="mr-auto text-destructive" onClick={() => window.confirm("Delete this post permanently?") && del.mutate()}><Trash2 className="size-4" />Delete</Button>
          <label className="flex items-center gap-2 text-sm font-medium"><Switch checked={f.published} onCheckedChange={(v) => set("published", v)} />{f.published ? "Published" : "Draft"}</label>
          <Button onClick={() => save.mutate()} disabled={save.isPending || !f.title.trim() || !f.slug.trim()}><Save className="size-4" />{save.isPending ? "Saving…" : "Save"}</Button>
        </div>
      </div>

      <MediaPicker open={picking} onOpenChange={setPicking} kind="image" onPick={(m) => insert(`![${m.alt || m.name || "Image"}](${m.url})\n`)} />
    </div>
  );
}
