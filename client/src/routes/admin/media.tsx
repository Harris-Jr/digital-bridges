import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, FileText, Film, Link2, Loader2, Music, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { AdminHeader, uploadToLibrary, type MediaItem } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/media")({ component: MediaLibrary });

const TABS = [
  { value: "", label: "All" },
  { value: "image", label: "Images" },
  { value: "video", label: "Video" },
  { value: "audio", label: "Audio" },
  { value: "file", label: "Documents" },
] as const;

const size = (b: number | null) => (b == null ? "" : b > 1_048_576 ? `${(b / 1_048_576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

function MediaLibrary() {
  const qc = useQueryClient();
  const [kind, setKind] = useState<string>("");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(0);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cfg = useQuery({ queryKey: ["media-config"], queryFn: () => apiGet<{ enabled: boolean }>("/admin/media/config"), staleTime: 5 * 60_000 });
  const list = useQuery({
    queryKey: ["admin", "media", kind || "all", q],
    queryFn: () => apiGet<MediaItem[]>(`/admin/media/items?${kind ? `kind=${kind}&` : ""}q=${encodeURIComponent(q)}`),
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "media"] });

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const arr = Array.from(files);
    setBusy(arr.length);
    let ok = 0;
    for (const f of arr) {
      if (f.size > 20 * 1024 * 1024) { toast.error(`${f.name} is larger than 20 MB.`); setBusy((n) => n - 1); continue; }
      try { await uploadToLibrary(f); ok++; } catch (e) { toast.error(`${f.name}: ${e instanceof Error ? e.message : "upload failed"}`); }
      setBusy((n) => n - 1);
    }
    if (ok) toast.success(`${ok} file${ok === 1 ? "" : "s"} uploaded`);
    if (inputRef.current) inputRef.current.value = "";
    refresh();
  };

  return (
    <>
      <AdminHeader
        title="Media library"
        description="Every image, audio, video and document used on the site. Upload once, reuse anywhere."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setLinkOpen(true)}><Link2 className="size-4" />Add by link</Button>
            {cfg.data?.enabled && (
              <>
                <input ref={inputRef} type="file" multiple accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" className="hidden" onChange={(e) => void onFiles(e.target.files)} />
                <Button onClick={() => inputRef.current?.click()} disabled={busy > 0}>
                  {busy > 0 ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                  {busy > 0 ? `Uploading ${busy}…` : "Upload files"}
                </Button>
              </>
            )}
          </div>
        }
      />
      {cfg.data && !cfg.data.enabled && (
        <p className="mb-4 rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground">Uploads are off until Cloudinary keys are added to the server .env. You can still add files by link.</p>
      )}

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {TABS.map((t) => (
            <button key={t.value} onClick={() => setKind(t.value)} aria-pressed={kind === t.value}
              className={cn("min-h-9 rounded-full border px-3.5 text-sm font-semibold", kind === t.value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary")}>
              {t.label}
            </button>
          ))}
        </div>
        <Input name="media-search" aria-label="Search media" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or description" className="h-10 md:w-72" />
      </div>

      {/* Drop zone */}
      {cfg.data?.enabled && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); void onFiles(e.dataTransfer.files); }}
          className="mb-5 hidden rounded-2xl border-2 border-dashed border-border bg-card/60 p-6 text-center text-sm text-muted-foreground md:block"
        >
          Drag and drop files here to upload (max 20 MB each)
        </div>
      )}

      {list.isLoading ? (
        <div className="py-16 text-center"><Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" /></div>
      ) : (list.data?.length ?? 0) === 0 ? (
        <p className="rounded-xl border border-border bg-card px-4 py-12 text-center text-sm text-muted-foreground">No files yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {list.data!.map((m) => (
            <button key={m.id} type="button" onClick={() => setSelected(m)}
              className="group overflow-hidden rounded-xl border border-border bg-card text-left transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <Thumb m={m} />
              <div className="px-2.5 py-2">
                <p className="truncate text-sm font-medium">{m.name || m.url.split("/").pop()}</p>
                <p className="text-xs text-muted-foreground">{[m.kind, size(m.bytes), m.width && m.height ? `${m.width}×${m.height}` : ""].filter(Boolean).join(" · ")}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      <ItemDialog item={selected} onClose={() => setSelected(null)} onChanged={refresh} />
      <AddLinkDialog open={linkOpen} onOpenChange={setLinkOpen} onAdded={refresh} />
    </>
  );
}

function Thumb({ m, large = false }: { m: MediaItem; large?: boolean }) {
  const box = cn("grid w-full place-items-center bg-secondary", large ? "aspect-video" : "aspect-[4/3]");
  if (m.kind === "image") return <img src={m.url} alt={m.alt} loading="lazy" className={cn("w-full bg-secondary object-cover", large ? "max-h-80 object-contain" : "aspect-[4/3]")} />;
  if (m.kind === "audio") return large ? <div className="p-4"><audio controls src={m.url} className="w-full" /></div> : <div className={box}><Music className="size-8 text-primary" /></div>;
  if (m.kind === "video") return large ? <video controls src={m.url} className="max-h-80 w-full bg-black" /> : <div className={box}><Film className="size-8 text-primary" /></div>;
  return <div className={box}><FileText className="size-8 text-primary" /></div>;
}

function ItemDialog({ item, onClose, onChanged }: { item: MediaItem | null; onClose: () => void; onChanged: () => void }) {
  const [name, setName] = useState("");
  const [alt, setAlt] = useState("");
  const [copied, setCopied] = useState(false);
  const [forId, setForId] = useState<string | null>(null);
  if (item && forId !== item.id) { setForId(item.id); setName(item.name); setAlt(item.alt); setCopied(false); }

  const save = useMutation({
    mutationFn: () => apiPatch(`/admin/media/items/${item!.id}`, { name, alt }),
    onSuccess: () => { toast.success("Saved"); onChanged(); onClose(); },
    onError: () => toast.error("Could not save."),
  });
  const del = useMutation({
    mutationFn: () => apiDelete<{ cloudDeleted: boolean }>(`/admin/media/items/${item!.id}`),
    onSuccess: () => { toast.success("Removed from the library"); onChanged(); onClose(); },
    onError: () => toast.error("Could not delete."),
  });
  if (!item) return null;
  const abs = item.url.startsWith("/") ? window.location.origin + item.url : item.url;
  const copy = async () => { try { await navigator.clipboard.writeText(abs); setCopied(true); } catch { toast.error("Could not copy"); } };
  const snippet = item.kind === "image" ? `![${alt || "Description"}](${item.url})` : `[${name || "Download"}](${item.url})`;

  return (
    <Dialog open={!!item} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader><DialogTitle>{item.name || "File"}</DialogTitle></DialogHeader>
        <div className="overflow-hidden rounded-xl border border-border"><Thumb m={item} large /></div>
        <div className="space-y-3">
          <div><Label htmlFor="mn">Name</Label><Input id="mn" className="mt-1 h-10" value={name} onChange={(e) => setName(e.target.value)} /></div>
          {item.kind === "image" && (
            <div><Label htmlFor="ma">Description (alt text)</Label><Input id="ma" className="mt-1 h-10" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="What the picture shows, for people using screen readers" /></div>
          )}
          <div>
            <Label>Link</Label>
            <div className="mt-1 flex gap-2">
              <Input readOnly value={abs} onFocus={(e) => e.currentTarget.select()} className="h-10 min-w-0 flex-1" />
              <Button variant="outline" className="h-10" onClick={copy}>{copied ? <Check className="size-4" /> : <Copy className="size-4" />}{copied ? "Copied" : "Copy"}</Button>
            </div>
          </div>
          <div>
            <Label>Use in a lesson or news post</Label>
            <code className="mt-1 block break-all rounded-lg bg-secondary px-3 py-2 text-xs">{snippet}</code>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="ghost" className="text-destructive" onClick={() => window.confirm("Remove this file from the library? Pages still using its link may show a broken image.") && del.mutate()} disabled={del.isPending}>
            <Trash2 className="size-4" />Delete
          </Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddLinkDialog({ open, onOpenChange, onAdded }: { open: boolean; onOpenChange: (o: boolean) => void; onAdded: () => void }) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [kind, setKind] = useState<MediaItem["kind"]>("image");
  const add = useMutation({
    mutationFn: () => apiPost("/admin/media/items", { url: url.trim(), name: name.trim(), kind }),
    onSuccess: () => { toast.success("Added to the library"); setUrl(""); setName(""); onOpenChange(false); onAdded(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not add that link."),
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Add a file by link</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label htmlFor="lu">Link</Label><Input id="lu" className="mt-1 h-10" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://… or /materials/guide.pdf" /></div>
          <div><Label htmlFor="ln">Name</Label><Input id="ln" className="mt-1 h-10" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div>
            <Label htmlFor="lk">Type</Label>
            <select id="lk" value={kind} onChange={(e) => setKind(e.target.value as MediaItem["kind"])} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="image">Image</option><option value="video">Video</option><option value="audio">Audio</option><option value="file">Document</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => add.mutate()} disabled={!url.trim() || add.isPending}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
