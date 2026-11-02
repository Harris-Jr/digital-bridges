import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Download, Globe, Loader2, Lock, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiPost } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

/* Share a badge or certificate.

   Private by default. The first step makes the credential public, which creates
   a verification page (/verify/<kind>/<id>) showing only the learner's name and
   the achievement. After that the learner can share the link on WhatsApp (most
   used in Zambia), Facebook, LinkedIn or X, copy it, or download an image.
   "Stop sharing" takes the public page down again. */

export type Shareable = {
  kind: "badge" | "certificate";
  /** Badge: the badge id. Certificate: the course slug. Used for the toggle call. */
  key: string;
  title: string;
  learnerName: string;
  issuedAt: string | null;
  isPublic: boolean;
  /** Public id for the verification URL (badge share_id or certificate id). */
  publicId: string | null;
};

export function verifyUrl(kind: Shareable["kind"], id: string) {
  return `${window.location.origin}/verify/${kind}/${id}`;
}

export function ShareDialog({ item, open, onOpenChange }: { item: Shareable | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [state, setState] = useState<{ isPublic: boolean; publicId: string | null } | null>(null);
  const [copied, setCopied] = useState(false);

  // Reset local state whenever a different credential is opened.
  const [forKey, setForKey] = useState<string | null>(null);
  if (item && forKey !== `${item.kind}:${item.key}`) {
    setForKey(`${item.kind}:${item.key}`);
    setState({ isPublic: item.isPublic, publicId: item.publicId });
    setCopied(false);
  }

  const toggle = useMutation({
    mutationFn: async (makePublic: boolean) => {
      if (!item) throw new Error("Nothing to share");
      const path = item.kind === "badge" ? `/me/badges/${item.key}/share` : `/me/certificates/${item.key}/share`;
      const r = await apiPost<{ is_public: boolean; share_id?: string; id?: string }>(path, { public: makePublic });
      return { isPublic: r.is_public, publicId: r.share_id ?? r.id ?? null };
    },
    onSuccess: (r) => {
      setState(r);
      qc.invalidateQueries({ queryKey: ["my-badges"] });
      qc.invalidateQueries({ queryKey: ["certificates"] });
      qc.invalidateQueries({ queryKey: ["certificate"] });
      if (!r.isPublic) toast.success(t("share.stopped", "Sharing turned off. The public page is gone."));
    },
    onError: () => toast.error(t("share.error", "We could not change sharing. Try again.")),
  });

  if (!item || !state) return null;
  const url = state.publicId ? verifyUrl(item.kind, state.publicId) : "";
  const noun = item.kind === "badge" ? t("share.badge", "badge") : t("share.certificate", "certificate");
  const text = item.kind === "badge"
    ? `I earned the "${item.title}" badge on Civic Wise, free digital and civic skills for Zambia.`
    : `I completed "${item.title}" on Civic Wise, free digital and civic skills for Zambia.`;
  const enc = encodeURIComponent;
  const issued = item.issuedAt ? new Date(item.issuedAt) : new Date();

  const targets = [
    { label: "WhatsApp", href: `https://wa.me/?text=${enc(`${text} ${url}`)}`, cls: "bg-[#25D366] text-white hover:bg-[#1ebe5b]" },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, cls: "bg-[#1877F2] text-white hover:bg-[#0f66d8]" },
    item.kind === "certificate"
      ? { label: t("share.linkedinAdd", "Add to LinkedIn"), href: `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${enc(item.title)}&organizationName=${enc("Civic Wise")}&issueYear=${issued.getFullYear()}&issueMonth=${issued.getMonth() + 1}&certUrl=${enc(url)}&certId=${enc(state.publicId ?? "")}`, cls: "bg-[#0A66C2] text-white hover:bg-[#0957a6]" }
      : { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`, cls: "bg-[#0A66C2] text-white hover:bg-[#0957a6]" },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`, cls: "bg-foreground text-background hover:opacity-90" },
  ];

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { toast.error(t("share.copyFail", "Could not copy. Press and hold the link to copy it.")); }
  };
  const nativeShare = async () => {
    try { await navigator.share({ title: item.title, text, url }); } catch { /* cancelled */ }
  };
  const download = async () => {
    try {
      const blob = await renderCredentialImage({ kind: item.kind, title: item.title, learnerName: item.learnerName, issuedAt: item.issuedAt, url });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `civic-wise-${item.kind}-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    } catch {
      toast.error(t("share.imageFail", "Could not make the image. Try again."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("share.title", "Share your")} {noun}</DialogTitle>
          <DialogDescription>{item.title}</DialogDescription>
        </DialogHeader>

        {!state.isPublic ? (
          <div className="space-y-4">
            <div className="flex gap-3 rounded-xl border border-border bg-secondary/50 p-4 text-sm">
              <Lock className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
              <p>{t("share.privateNote", "Your achievements are private. Sharing creates a public page that shows only your name, this achievement and the date. You can stop sharing at any time.")}</p>
            </div>
            <Button className="w-full" onClick={() => toggle.mutate(true)} disabled={toggle.isPending}>
              {toggle.isPending ? <Loader2 className="size-4 animate-spin" /> : <Globe className="size-4" />}
              {t("share.makePublic", "Create a share link")}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {typeof navigator !== "undefined" && "share" in navigator && (
              <Button className="w-full" onClick={nativeShare}><Share2 className="size-4" />{t("share.native", "Share")}</Button>
            )}
            <div className="grid grid-cols-2 gap-2">
              {targets.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  className={`inline-flex min-h-11 items-center justify-center rounded-xl px-3 text-sm font-semibold transition-colors ${s.cls}`}>
                  {s.label}
                </a>
              ))}
            </div>
            <div className="flex gap-2">
              <input name="share-link" readOnly value={url} onFocus={(e) => e.currentTarget.select()} aria-label={t("share.link", "Share link")}
                className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-background px-3 text-sm" />
              <Button variant="outline" onClick={copy} className="h-11 shrink-0">{copied ? <Check className="size-4" /> : <Copy className="size-4" />}{copied ? t("share.copied", "Copied") : t("share.copy", "Copy")}</Button>
            </div>
            <Button variant="outline" className="w-full" onClick={download}><Download className="size-4" />{t("share.download", "Download image")}</Button>
            <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
              <a href={url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline">{t("share.preview", "View public page")}</a>
              <button onClick={() => toggle.mutate(false)} disabled={toggle.isPending} className="text-muted-foreground underline hover:text-destructive">
                {t("share.stop", "Stop sharing")}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* Draw a 1200x630 share card (the standard social image size) on a canvas.
   No external libraries or fonts needed, so it works offline. */
async function renderCredentialImage(o: { kind: Shareable["kind"]; title: string; learnerName: string; issuedAt: string | null; url: string }): Promise<Blob> {
  const W = 1200, H = 630;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d");
  if (!g) throw new Error("no canvas");
  const green = "#14532D", gold = "#F59E0B", cream = "#FBF8F1";

  g.fillStyle = cream; g.fillRect(0, 0, W, H);
  g.fillStyle = green; g.fillRect(0, 0, W, 14); g.fillRect(0, H - 14, W, 14);
  g.strokeStyle = green; g.lineWidth = 4; g.strokeRect(40, 40, W - 80, H - 80);

  // Hexagon medal
  const cx = 230, cy = H / 2, r = 120;
  const hex = (rad: number) => { g.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI / 3 * i - Math.PI / 2; g.lineTo(cx + rad * Math.cos(a), cy + rad * Math.sin(a)); } g.closePath(); };
  hex(r); g.fillStyle = gold; g.fill();
  hex(r - 22); g.fillStyle = green; g.fill();
  g.fillStyle = gold; g.font = "bold 84px system-ui, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(o.kind === "badge" ? "★" : "✓", cx, cy + 4);

  // Text
  g.textAlign = "left"; g.textBaseline = "alphabetic";
  const x = 410, maxW = W - x - 80;
  g.fillStyle = green; g.font = "bold 26px system-ui, sans-serif";
  g.fillText(o.kind === "badge" ? "BADGE EARNED" : "CERTIFICATE OF COMPLETION", x, 170);
  g.fillStyle = "#1c1917"; g.font = "800 58px system-ui, sans-serif";
  let y = 250;
  for (const line of wrap(g, o.title, maxW).slice(0, 2)) { g.fillText(line, x, y); y += 66; }
  g.fillStyle = "#57534e"; g.font = "28px system-ui, sans-serif";
  g.fillText(`Awarded to ${o.learnerName}`, x, y + 20);
  if (o.issuedAt) g.fillText(new Date(o.issuedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }), x, y + 62);
  g.fillStyle = green; g.font = "bold 30px system-ui, sans-serif";
  g.fillText("Civic Wise", x, H - 110);
  g.fillStyle = "#78716c"; g.font = "20px system-ui, sans-serif";
  g.fillText(`Verify: ${o.url.replace(/^https?:\/\//, "")}`, x, H - 76);

  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error("blob"))), "image/png"));
}

function wrap(g: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (g.measureText(next).width > maxW && cur) { lines.push(cur); cur = w; } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}
