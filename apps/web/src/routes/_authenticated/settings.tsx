import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Trash2, Cookie, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { SiteLayout, PageHero } from "@/components/site";
import { useAuth } from "@/lib/auth";
import { useI18n, LANGS, type Lang } from "@/lib/i18n";
import { useConsent } from "@/lib/consent";
import { usePolicyVersion } from "@/lib/content";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Digital Bridges" },
      { name: "description", content: "Manage your profile, language, cookies and personal data." },
      { property: "og:title", content: "Settings — Digital Bridges" },
      { property: "og:description", content: "Manage your profile and your data." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { user, profile, refresh } = useAuth();
  const { setLang, lang } = useI18n();
  const { openManager } = useConsent();
  const version = usePolicyVersion() ?? "1.0";
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [f, setF] = useState({ full_name: "", phone: "", district: "" });
  const [confirm1, setConfirm1] = useState(false);
  const [confirm2, setConfirm2] = useState(false);
  const [typed, setTyped] = useState("");
  const [newPw, setNewPw] = useState("");
  useEffect(() => {
    if (profile) setF({ full_name: profile.full_name ?? "", phone: profile.phone ?? "", district: profile.district ?? "" });
  }, [profile]);
  const adminExists = useQuery({
    queryKey: ["admin-exists"],
    queryFn: async () => (await supabase.rpc("admin_exists")).data ?? true,
  });

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("profiles").update({ ...f, language_pref: lang, updated_at: new Date().toISOString() }).eq("id", user!.id);
    if (error) { toast.error("We could not save your profile. Please try again."); return; }
    await refresh();
    toast.success("Profile saved");
  };

  const pickLang = async (l: Lang) => {
    setLang(l);
    await supabase.from("profiles").update({ language_pref: l }).eq("id", user!.id);
  };

  const exportData = async () => {
    const [p, prog, badges, consents, workshops] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle(),
      supabase.from("lesson_progress").select("lesson_id, completed_at, lessons(title)"),
      supabase.from("user_badges").select("earned_at, badges(name)"),
      supabase.from("consent_records").select("type, version, granted, details, granted_at").eq("user_id", user!.id),
      supabase.from("workshop_requests").select("*").eq("trainer_id", user!.id),
    ]);
    const payload = {
      exported_at: new Date().toISOString(),
      account: { id: user!.id, email: user!.email },
      profile: p.data,
      lesson_progress: prog.data,
      badges: badges.data,
      consent_records: consents.data,
      workshop_requests: workshops.data,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `digital-bridges-my-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    await supabase.from("consent_records").insert({ user_id: user!.id, type: "data_export", version, granted: true });
    await supabase.from("data_requests").insert({ user_id: user!.id, type: "export", status: "done" });
    toast.success("Your data has been downloaded");
  };

  const deleteAccount = async () => {
    const uid = user!.id;
    await supabase.from("consent_records").insert({ user_id: uid, type: "data_deletion", version, granted: true });
    await supabase.from("data_requests").insert({ user_id: uid, type: "delete" });
    await Promise.all([
      supabase.from("lesson_progress").delete().eq("user_id", uid),
      supabase.from("user_badges").delete().eq("user_id", uid),
      supabase.from("profiles").update({ full_name: "Deleted learner", phone: null, district: null, anonymized: true }).eq("id", uid),
    ]);
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Your account has been deleted.");
    navigate({ to: "/", replace: true });
  };

  const claimAdmin = async () => {
    const { data } = await supabase.rpc("claim_first_admin");
    if (data) {
      await refresh();
      toast.success("You are now the site admin.");
      qc.invalidateQueries({ queryKey: ["admin-exists"] });
    } else toast.error("An admin already exists.");
  };

  const changePw = async () => {
    if (newPw.length < 8) { toast.error("Use at least 8 characters."); return; }
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) { toast.error("We could not change your password."); return; }
    setNewPw("");
    toast.success("Password changed");
  };

  return (
    <SiteLayout>
      <PageHero eyebrow="Settings" title="Your account" />
      <div className="container-page grid max-w-3xl gap-6">
        <form onSubmit={saveProfile} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl">Profile</h2>
          <p className="text-sm text-muted-foreground">Signed in as {user?.email}</p>
          {(
            [
              ["full_name", "Your name"],
              ["phone", "Phone number (optional)"],
              ["district", "District (optional)"],
            ] as const
          ).map(([k, label]) => (
            <div key={k}><Label htmlFor={k}>{label}</Label><Input id={k} className="mt-1 h-11" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></div>
          ))}
          <Button type="submit">Save profile</Button>
        </form>

        <div className="space-y-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl">New password</h2>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Label htmlFor="newpw" className="sr-only">New password</Label>
            <Input id="newpw" type="password" autoComplete="new-password" className="h-11" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="At least 8 characters" />
            <Button type="button" variant="outline" onClick={changePw}>Change password</Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl">Language</h2>
          <p className="text-sm text-muted-foreground">Menus switch now. Lesson translations are rolling out.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {LANGS.map((l) => (
              <button key={l.code} onClick={() => pickLang(l.code)} aria-pressed={lang === l.code}
                className={cn("min-h-11 rounded-full border px-5 font-semibold", lang === l.code ? "border-primary bg-primary text-primary-foreground" : "border-border")}>
                {l.name}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl">Your data</h2>
          <p className="text-sm text-muted-foreground">Under the Data Protection Act No. 3 of 2021 you can get a copy of your data or delete it.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportData}><Download />Download my data</Button>
            <Button variant="outline" onClick={openManager}><Cookie />Cookie preferences</Button>
            <Button variant="destructive" onClick={() => setConfirm1(true)}><Trash2 />Delete my account</Button>
          </div>
        </div>

        {adminExists.data === false && (
          <div className="rounded-2xl border border-accent bg-accent-soft p-6">
            <h2 className="flex items-center gap-2 text-xl"><ShieldCheck className="size-5" aria-hidden="true" />Set up site admin</h2>
            <p className="mt-1 text-sm">No one manages this site yet. The first person to claim admin can edit all content.</p>
            <Button className="mt-3" onClick={claimAdmin}>Make me the admin</Button>
          </div>
        )}
      </div>

      <AlertDialog open={confirm1} onOpenChange={setConfirm1}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>Your name, phone, district, progress and badges will be removed. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep my account</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setConfirm1(false); setConfirm2(true); }} className="bg-destructive text-destructive-foreground">Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={confirm2} onOpenChange={(o) => { setConfirm2(o); if (!o) setTyped(""); }}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you completely sure?</AlertDialogTitle>
            <AlertDialogDescription>Type DELETE to confirm.</AlertDialogDescription>
          </AlertDialogHeader>
          <Label htmlFor="typed" className="sr-only">Type DELETE</Label>
          <Input id="typed" value={typed} onChange={(e) => setTyped(e.target.value)} className="h-11" />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant="destructive" disabled={typed !== "DELETE"} onClick={deleteAccount}>Delete forever</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SiteLayout>
  );
}
