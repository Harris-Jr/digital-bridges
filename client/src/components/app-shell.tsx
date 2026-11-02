import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { GraduationCap, BookOpen, Users, Settings, ShieldCheck, LogOut, Menu, X, Loader2, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Logo, SiteLayout } from "@/components/site";
import { getToken } from "@/lib/api";
import { AssistantWidget } from "@/components/assistant-widget";
import { OfflineBar } from "@/components/offline-sync";
import { useAuth } from "@/lib/auth";
import { useI18n, LANGS } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Remembered collapsed/expanded state for a desktop sidebar (per browser). */
export function useCollapsed(key: string): [boolean, () => void] {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem(key) === "1"; } catch { return false; }
  });
  const toggle = () => setCollapsed((c) => {
    const next = !c;
    try { localStorage.setItem(key, next ? "1" : "0"); } catch { /* storage unavailable */ }
    return next;
  });
  return [collapsed, toggle];
}

/* App shell for signed-in pages: a collapsible left sidebar on desktop, a
   slide-in drawer on mobile. Replaces the public top nav with account navigation.
   The logo links home, so there is no separate "Home" item. */
export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [collapsed, toggle] = useCollapsed("cw_sidebar_collapsed");
  const { loading, user } = useAuth();
  const navigate = useNavigate();

  // Never render private pages without a session (expired token, signed out in
  // another tab, or a deleted account). The API still enforces auth regardless.
  useEffect(() => {
    if (!loading && !user) navigate({ to: "/signin", replace: true });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <OfflineBar />
      <div className={cn("lg:grid lg:transition-[grid-template-columns] lg:duration-200", collapsed ? "lg:grid-cols-[76px_1fr]" : "lg:grid-cols-[256px_1fr]")}>
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen flex-col border-r border-border bg-card lg:flex">
          <SidebarInner collapsed={collapsed} onToggle={toggle} />
        </aside>

        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/95 px-4 py-3 backdrop-blur lg:hidden">
          <Logo className="shrink-0" imgClassName="h-10" />
          <button onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} className="grid size-10 place-items-center rounded-full hover:bg-secondary">
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

function SidebarInner({ onNavigate, collapsed = false, onToggle }: { onNavigate?: () => void; collapsed?: boolean; onToggle?: () => void }) {
  const { user, profile, isTrainer, isStaff, signOut } = useAuth();
  const { t, lang, setLang } = useI18n();

  const nav = [
    { to: "/dashboard", label: t("nav.dashboard", "My learning"), icon: GraduationCap },
    { to: "/courses", label: t("nav.courses", "Courses"), icon: BookOpen },
    ...(isTrainer ? [{ to: "/trainer", label: t("nav.trainers", "For Trainers"), icon: Users }] : []),
    { to: "/settings", label: t("nav.settings", "Settings"), icon: Settings },
    ...(isStaff ? [{ to: "/admin", label: t("nav.admin", "Admin"), icon: ShieldCheck }] : []),
  ];

  const name = profile?.full_name?.trim() || user?.email?.split("@")[0] || "";
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className={cn("flex h-full flex-col overflow-y-auto", collapsed ? "items-center p-3" : "p-4")}>
      <div className={cn("flex items-center", collapsed ? "flex-col gap-3 py-2" : "justify-between px-2 py-2")}>
        {collapsed ? (
          // Collapsed: show only the emblem (left part of the lockup).
          <Link to="/" aria-label="Civic Wise home" className="block size-11 overflow-hidden">
            <img src="/images/civic-wise-logo.png" alt="" className="h-11 w-auto max-w-none" />
          </Link>
        ) : <Logo />}
        {onToggle && (
          <button onClick={onToggle} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
          </button>
        )}
      </div>

      <nav className={cn("mt-4 flex-1 space-y-1", collapsed && "w-full")}>
        {nav.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            onClick={onNavigate}
            title={collapsed ? n.label : undefined}
            aria-label={collapsed ? n.label : undefined}
            activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}
            className={cn("flex min-h-11 items-center rounded-xl font-medium text-foreground/80 transition-colors hover:bg-secondary", collapsed ? "justify-center" : "gap-3 px-3")}
          >
            <n.icon className="size-5 shrink-0" aria-hidden="true" />
            {!collapsed && n.label}
          </Link>
        ))}
      </nav>

      {/* Language */}
      {collapsed ? (
        <button
          onClick={() => { const i = LANGS.findIndex((l) => l.code === lang); setLang(LANGS[(i + 1) % LANGS.length]!.code); }}
          title="Change language" aria-label="Change language"
          className="mt-4 grid size-11 place-items-center rounded-full border border-border bg-background text-xs font-bold text-primary">
          {(LANGS.find((l) => l.code === lang) ?? LANGS[0]!).label}
        </button>
      ) : (
        <div className="mt-4 flex rounded-full border border-border bg-background p-1">
          {LANGS.map((l) => (
            <button key={l.code} onClick={() => setLang(l.code)} aria-pressed={lang === l.code}
              className={cn("min-h-8 flex-1 rounded-full text-xs font-semibold transition-colors", lang === l.code ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              {l.label}
            </button>
          ))}
        </div>
      )}

      {/* User card */}
      {collapsed ? (
        <div className="mt-3 flex flex-col items-center gap-2">
          <div title={name} className="grid size-10 place-items-center rounded-full bg-primary font-display text-sm font-extrabold text-primary-foreground">{initials}</div>
          <button onClick={() => void signOut()} title={t("nav.signout", "Sign out")} aria-label={t("nav.signout", "Sign out")}
            className="grid size-10 place-items-center rounded-xl border border-border text-foreground/80 hover:bg-secondary">
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className="mt-3 rounded-2xl border border-border bg-background p-3">
          <div className="flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary font-display text-sm font-extrabold text-primary-foreground">{initials}</div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{name}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <button onClick={() => { onNavigate?.(); void signOut(); }} className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-semibold text-foreground/80 transition-colors hover:bg-secondary">
            <LogOut className="size-4" aria-hidden="true" />{t("nav.signout", "Sign out")}
          </button>
        </div>
      )}
    </div>
  );
}

/** Public pages that also live inside the app when signed in (course pages):
    the app shell for a signed-in learner, the public site layout otherwise. */
export function AdaptiveLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (user || (loading && getToken())) return <AppShell>{children}</AppShell>;
  return <SiteLayout>{children}</SiteLayout>;
}
