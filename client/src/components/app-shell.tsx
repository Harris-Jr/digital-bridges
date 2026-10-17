import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { GraduationCap, BookOpen, Users, Settings, ShieldCheck, LogOut, Menu, X, Home } from "lucide-react";
import { Logo } from "@/components/site";
import { AssistantWidget } from "@/components/assistant-widget";
import { OfflineBar } from "@/components/offline-sync";
import { useAuth } from "@/lib/auth";
import { useI18n, LANGS } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/* App shell for signed-in pages: a left sidebar on desktop, a slide-in drawer
   on mobile. Replaces the public top nav with an account-area navigation. */
export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-muted/30">
      <OfflineBar />
      <div className="lg:grid lg:grid-cols-[256px_1fr]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen flex-col border-r border-border bg-card lg:flex">
          <SidebarInner />
        </aside>

        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
          <Logo className="shrink-0" />
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="grid size-10 place-items-center rounded-full hover:bg-secondary">
            <Menu className="size-5" />
          </button>
        </header>

        {/* Mobile drawer */}
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-card shadow-xl">
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-3 top-3 grid size-9 place-items-center rounded-full hover:bg-secondary">
                <X className="size-5" />
              </button>
              <SidebarInner onNavigate={() => setOpen(false)} />
            </div>
          </div>
        )}

        <main className="min-w-0">{children}</main>
      </div>
      <AssistantWidget />
    </div>
  );
}

function SidebarInner({ onNavigate }: { onNavigate?: () => void }) {
  const { user, profile, isTrainer, isStaff, signOut } = useAuth();
  const { t, lang, setLang } = useI18n();

  const nav = [
    { to: "/dashboard", label: t("nav.dashboard", "My learning"), icon: GraduationCap },
    { to: "/courses", label: t("nav.courses", "Courses"), icon: BookOpen },
    ...(isTrainer ? [{ to: "/trainer", label: t("nav.trainers", "For Trainers"), icon: Users }] : []),
    { to: "/settings", label: t("nav.settings", "Settings"), icon: Settings },
    ...(isStaff ? [{ to: "/admin", label: t("nav.admin", "Admin"), icon: ShieldCheck }] : []),
  ];

  const name = profile?.full_name?.trim() || user?.email?.split("@")[0] || "Learner";
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      <div className="px-2 py-2"><Logo /></div>

      <nav className="mt-4 flex-1 space-y-1">
        {nav.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            onClick={onNavigate}
            activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}
            className="flex min-h-11 items-center gap-3 rounded-xl px-3 font-medium text-foreground/80 transition-colors hover:bg-secondary"
          >
            <n.icon className="size-5 shrink-0" aria-hidden="true" />
            {n.label}
          </Link>
        ))}
        <Link to="/" onClick={onNavigate} className="flex min-h-11 items-center gap-3 rounded-xl px-3 font-medium text-foreground/60 transition-colors hover:bg-secondary">
          <Home className="size-5 shrink-0" aria-hidden="true" />
          {t("nav.home", "Home")}
        </Link>
      </nav>

      {/* Language */}
      <div className="mt-4 flex rounded-full border border-border bg-background p-1">
        {LANGS.map((l) => (
          <button key={l.code} onClick={() => setLang(l.code)} aria-pressed={lang === l.code}
            className={cn("min-h-8 flex-1 rounded-full text-xs font-semibold transition-colors", lang === l.code ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
            {l.label}
          </button>
        ))}
      </div>

      {/* User card */}
      <div className="mt-3 rounded-2xl border border-border bg-background p-3">
        <div className="flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary font-display text-sm font-extrabold text-primary-foreground">{initials}</div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <button onClick={() => { onNavigate?.(); signOut(); }} className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-semibold text-foreground/80 transition-colors hover:bg-secondary">
          <LogOut className="size-4" aria-hidden="true" />{t("nav.signout", "Sign out")}
        </button>
      </div>
    </div>
  );
}
