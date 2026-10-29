import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminShell, AdminHeader, MediaUpload } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { apiGet, apiPut } from "@/lib/api";

export const Route = createFileRoute("/admin/branding")({ component: Branding });

const KEYS = [
  { key: "brand_logo_url", label: "Logo", help: "Shown in the top navigation, footer and certificates. Leave empty to use the Civic Wise text wordmark." },
  { key: "about_image_url", label: "About page image", help: "The photograph in the About page hero. Leave empty to show the brand illustration." },
  { key: "trainers_image_url", label: "For Trainers image", help: "The photograph in the For Trainers hero. Leave empty to show the brand illustration." },
] as const;

function Branding() {
  const q = useQuery({ queryKey: ["admin-settings"], queryFn: () => apiGet<Record<string, string | null>>("/admin/settings") });
  const [vals, setVals] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (q.data) setVals(Object.fromEntries(KEYS.map((k) => [k.key, q.data[k.key] ?? ""])));
  }, [q.data]);

  const save = async (key: string) => {
    setBusy(key);
    try {
      await apiPut(`/admin/settings/${key}`, { value: vals[key]?.trim() || null });
      toast.success("Saved. Changes appear across the site.");
    } catch {
      toast.error("Could not save. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <AdminShell>
      <AdminHeader title="Branding & media" description="Logo and page images, served from Cloudinary. Upload a file or paste a URL, then Save." />
      <div className="max-w-xl space-y-10">
        {KEYS.map((k) => (
          <div key={k.key}>
            <Label className="text-base">{k.label}</Label>
            <p className="mb-3 mt-1 text-sm text-muted-foreground">{k.help}</p>
            <MediaUpload value={vals[k.key] ?? ""} onChange={(v) => setVals((s) => ({ ...s, [k.key]: v }))} kind="image" />
            <Button className="mt-3" onClick={() => save(k.key)} disabled={busy === k.key || q.isLoading}>
              {busy === k.key ? "Saving…" : "Save"}
            </Button>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
