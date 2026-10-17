import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Download, Trash2, Cookie, ShieldCheck, User as UserIcon, Lock, Languages, DatabaseZap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/auth";
import { useI18n, LANGS, type Lang } from "@/lib/i18n";
import { useConsent } from "@/lib/consent";
import { usePolicyVersion } from "@/lib/content";
import { apiGet, apiPatch, apiPost } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Digital Bridges" },
      { name: "description", content: "Manage your profile, language, cookies and personal data." },
    ],
  }),
  component: Settings,
});

/* A labelled settings row: title + description on the left, controls on the right. */
function Section({ icon: Icon, title, description, children }: { icon: typeof UserIcon; title: string; description: string; children: ReactNode }) {
  return (
    <section className="grid gap-5 border-t border-border py-8 md:grid-cols-[260px_1fr]">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold"><Icon className="size-5 text-primary" aria-hidden="true" />{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function Settings() {
  const { user, profile, refresh, signOut, isStaff } = useAuth();
  const { t, setLang, lang } = useI18n();
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

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiPatch("/profile", { ...f, language_pref: lang });
      await refresh();
      toast.success("Profile saved");
    } catch {
      toast.error("We could not save your profile. Please try again.");
    }
  };
  const pickLang = async (l: Lang) => {
    setLang(l);
    try { await apiPatch("/profile", { language_pref: l }); } catch { /* menu already switched locally */ }
  };
  const exportData = async () => {
    try {
      const payload = await apiGet("/me/export");
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `digital-bridges-my-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      await apiPost("/me/consent", { type: "data_export", version, granted: true });
      toast.success("Your data has been downloaded");
    } catch {
      toast.error("We could not prepare your data. Please try again.");
    }
  };
  const deleteAccount = async () => {
    try {
      await apiPost("/me/consent", { type: "data_deletion", version, granted: true });
      await apiPost("/me/delete");
      await qc.cancelQueries();
      qc.clear();
      await signOut();
      toast.success("Your account has been deleted.");
      navigate({ to: "/", replace: true });
    } catch {
      toast.error("We could not delete your account. Please try again.");
    }
  };
  const changePw = async () => {
    if (newPw.length < 8) { toast.error("Use at least 8 characters."); return; }
    try {
      await apiPatch("/auth/password", { password: newPw });
      setNewPw("");
      toast.success("Password changed");
    } catch {
      toast.error("We could not change your password.");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
      <header>
        <p className="eyebrow">{t("nav.settings", "Settings")}</p>
        <h1 className="mt-1 text-3xl md:text-4xl">{t("settings.title", "Your account")}</h1>
        <p className="mt-2 text-muted-foreground">{t("settings.sub", "Manage your profile, security, language and personal data.")}</p>
      </header>

      <div className="mt-6">
        <Section icon={UserIcon} title={t("settings.profile", "Profile")} description={t("settings.profileSub", "Your name and contact details.")}>
          <form onSubmit={saveProfile} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">{t("settings.signedinas", "Signed in as")} <span className="font-medium text-foreground">{user?.email}</span></p>
            {([["full_name", t("settings.name", "Your name")], ["phone", t("settings.phone", "Phone number (optional)")], ["district", t("settings.district", "District (optional)")]] as const).map(([k, label]) => (
              <div key={k}><Label htmlFor={k}>{label}</Label><Input id={k} className="mt-1 h-11" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></div>
            ))}
            <Button type="submit">{t("settings.save", "Save profile")}</Button>
          </form>
        </Section>

        <Section icon={Lock} title={t("settings.security", "Security")} description={t("settings.securitySub", "Change the password you use to sign in.")}>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <Label htmlFor="newpw">{t("settings.newpw", "New password")}</Label>
            <div className="mt-1 flex flex-col gap-2 sm:flex-row">
              <Input id="newpw" type="password" autoComplete="new-password" className="h-11" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder={t("settings.pwPlaceholder", "At least 8 characters")} />
              <Button type="button" variant="outline" onClick={changePw}>{t("settings.changepw", "Change password")}</Button>
            </div>
          </div>
        </Section>

        <Section icon={Languages} title={t("settings.language", "Language")} description={t("settings.languageSub", "Menus switch now. Lesson translations are rolling out.")}>
          <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
            {LANGS.map((l) => (
              <button key={l.code} onClick={() => pickLang(l.code)} aria-pressed={lang === l.code}
                className={cn("min-h-11 rounded-full border px-5 font-semibold transition-colors", lang === l.code ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary")}>
                {l.name}
              </button>
            ))}
          </div>
        </Section>

        <Section icon={DatabaseZap} title={t("settings.data", "Privacy & data")} description={t("settings.dataSub", "Under the Data Protection Act No. 3 of 2021 you can get a copy of your data or delete it.")}>
          <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <Button variant="outline" onClick={exportData}><Download />{t("settings.download", "Download my data")}</Button>
            <Button variant="outline" onClick={openManager}><Cookie />{t("settings.cookies", "Cookie preferences")}</Button>
            <Button variant="destructive" onClick={() => setConfirm1(true)}><Trash2 />{t("settings.delete", "Delete my account")}</Button>
          </div>
        </Section>

        {isStaff && (
          <Section icon={ShieldCheck} title={t("settings.admin", "Content management")} description={t("settings.adminSub", "You have editor access to the platform.")}>
            <div className="rounded-2xl border border-accent bg-accent-soft p-6">
              <p className="text-sm">{t("settings.adminBody", "Manage courses, lessons, pages, workshops and more in the admin area.")}</p>
              <Button asChild className="mt-3"><Link to="/admin">{t("settings.openadmin", "Open admin")}</Link></Button>
            </div>
          </Section>
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
    </div>
  );
}
