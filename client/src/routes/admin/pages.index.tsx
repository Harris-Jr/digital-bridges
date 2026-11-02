import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronRight, Eye, EyeOff, FileText, Home, Lock, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiGet, apiPost } from "@/lib/api";
import { slugify } from "@/lib/admin-course";
import type { Block } from "@/components/blocks";

export const Route = createFileRoute("/admin/pages/")({ component: PagesList });

export type AdminPage = {
  slug: string; hero_title: string; hero_subline: string; hero_eyebrow: string; hero_image_url: string | null;
  nav_label: string; body: Record<string, any>; blocks: Block[]; is_published: boolean; is_system: boolean; updated_at: string; // eslint-disable-line @typescript-eslint/no-explicit-any
};

/** Where a page lives on the public site. */
export const pagePath = (slug: string, system: boolean) =>
  !system ? `/p/${slug}` : slug === "home" ? "/" : slug === "trainers" ? "/for-trainers" : `/${slug}`;

const SYSTEM_NAMES: Record<string, string> = { home: "Home", about: "About", trainers: "For Trainers", privacy: "Privacy policy", terms: "Terms of use", accessibility: "Accessibility" };
export const pageName = (p: Pick<AdminPage, "slug" | "hero_title" | "is_system">) => (p.is_system ? SYSTEM_NAMES[p.slug] : undefined) ?? (p.hero_title || p.slug);
const ORDER = ["home", "about", "trainers", "privacy", "terms", "accessibility"];

function PagesList() {
  const navigate = useNavigate();
  const list = useQuery({ queryKey: ["admin", "pages"], queryFn: () => apiGet<AdminPage[]>("/admin/site-pages") });
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  const create = useMutation({
    mutationFn: () => apiPost<AdminPage>("/admin/site-pages", {
      slug, hero_title: title.trim(), is_published: false,
      blocks: [{ id: "b-intro", type: "text", data: { title: "", body: "Start writing here." } }],
    }),
    onSuccess: (p) => navigate({ to: "/admin/pages/$slug", params: { slug: p.slug } }),
    onError: (e) => toast.error(e instanceof Error && /duplicate|exists/i.test(e.message) ? "A page with that address already exists." : e instanceof Error ? e.message : "Could not create the page."),
  });

  const pages = [...(list.data ?? [])].sort((a, b) => {
    const ia = ORDER.indexOf(a.slug), ib = ORDER.indexOf(b.slug);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.hero_title.localeCompare(b.hero_title);
  });
  const builtIn = pages.filter((p) => p.is_system);
  const custom = pages.filter((p) => !p.is_system);

  return (
    <>
      <AdminHeader
        title="Site pages"
        description="Edit any page section by section: text, photos, buttons and the order of sections. Make new pages for campaigns or programmes."
        action={<Button onClick={() => { setTitle(""); setSlug(""); setSlugTouched(false); setOpen(true); }}><Plus className="size-4" />New page</Button>}
      />
      {list.isLoading ? (
        <div className="py-16 text-center"><Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-8">
          <PageGroup title="Built-in pages" pages={builtIn} />
          <PageGroup title="Your pages" pages={custom} empty="No pages yet. Use New page to make one, for example a programme or campaign page." />
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New page</DialogTitle></DialogHeader>
          <form id="npg" className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (title.trim() && slug) create.mutate(); }}>
            <div className="space-y-1.5">
              <Label htmlFor="np-title">Page title</Label>
              <Input id="np-title" autoFocus value={title} className="h-11" placeholder="For example: Women in Digital 2027"
                onChange={(e) => { setTitle(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="np-slug">Web address</Label>
              <div className="flex items-center rounded-md border border-input bg-background pl-3 text-sm text-muted-foreground focus-within:ring-2 focus-within:ring-ring">
                /p/<input id="np-slug" value={slug} onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }} className="h-11 flex-1 bg-transparent pr-3 text-foreground outline-none" />
              </div>
              <p className="text-xs text-muted-foreground">Lowercase words with dashes. It cannot be changed later.</p>
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" form="npg" disabled={!title.trim() || !slug || create.isPending}>Create and edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PageGroup({ title, pages, empty }: { title: string; pages: AdminPage[]; empty?: string }) {
  return (
    <section>
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h2>
      {pages.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {pages.map((p) => {
            const sections = (p.blocks ?? []).filter((b) => !b.hidden).length;
            return (
              <li key={p.slug}>
                <Link to="/admin/pages/$slug" params={{ slug: p.slug }} className="flex items-center gap-3 p-4 transition-colors hover:bg-secondary/60">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                    {p.slug === "home" ? <Home className="size-5" /> : <FileText className="size-5" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2 font-semibold">
                      {pageName(p)}
                      {p.is_system && <Lock className="size-3.5 text-muted-foreground" aria-label="Built-in" />}
                    </span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {pagePath(p.slug, p.is_system)}{sections > 0 && ` · ${sections} section${sections === 1 ? "" : "s"}`}{p.nav_label && ` · In menu as "${p.nav_label}"`}
                    </span>
                  </span>
                  <span className={p.is_published ? "hidden items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success sm:inline-flex" : "hidden items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground sm:inline-flex"}>
                    {p.is_published ? <Eye className="size-3" /> : <EyeOff className="size-3" />}{p.is_published ? "Published" : "Hidden"}
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
