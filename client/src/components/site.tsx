import { Link, useNavigate } from "@tanstack/react-router";
import {
  Menu, X, LogOut, LayoutDashboard, Settings, ShieldCheck, Clock, BookOpen, WifiOff,
  ArrowRight, GraduationCap, ChevronDown, Check,
  // Icons referenced by name from CMS data (category/course/pathway/badge icon_name)
  // and by EmptyState. Imported individually so lucide tree-shakes to just these
  // instead of bundling its whole ~1,000-icon registry on every page.
  Circle, Smartphone, Shield, Wallet, Users, Briefcase, Store, MessageCircle, MessageSquare,
  Landmark, Compass, FileSearch, Building2, Flame, Award, BookX, CalendarDays, FileX,
  FolderOpen, Megaphone, SearchX, SearchCheck, Footprints, Inbox, Radio, Phone, Globe, Lock,
  Scale, Gavel, Banknote, Coins, Receipt, ClipboardList, Vote, HandHeart, Heart, Newspaper,
  Eye, Lightbulb, HelpCircle, CheckCircle2, AlertTriangle, MapPin, Mic, UserCheck, FileCheck,
  Handshake, Map, Scroll, Building, type LucideIcon,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { useI18n, LANGS } from "@/lib/i18n";
import { useConsent } from "@/lib/consent";
import { type Course, usePublishedCourses, usePathways, useSetting } from "@/lib/content";
import { AssistantWidget } from "@/components/assistant-widget";
import { OfflineBar } from "@/components/offline-sync";
import { cn } from "@/lib/utils";

// Curated registry for CMS-driven icon names. Add a name here (and import it
// above) to make it available to content editors; unknown names fall back to a
// neutral circle.
const ICON_MAP: Record<string, LucideIcon> = {
  Circle, Smartphone, Shield, ShieldCheck, Wallet, Users, Briefcase, Store, MessageCircle,
  MessageSquare, Landmark, Compass, FileSearch, Building2, Building, Flame, Award, BookOpen,
  BookX, CalendarDays, FileX, FolderOpen, Megaphone, SearchX, SearchCheck, Footprints, Inbox,
  Radio, Phone, Globe, Lock, Scale, Gavel, Banknote, Coins, Receipt, ClipboardList, Vote,
  HandHeart, Heart, Newspaper, Eye, Lightbulb, HelpCircle, CheckCircle2, AlertTriangle, MapPin,
  Mic, UserCheck, FileCheck, Handshake, Map, Scroll, Settings,
};

export function Icon({ name, className }: { name?: string | null | undefined; className?: string }) {
  const C = (name && ICON_MAP[name]) || Circle;
  return <C className={className} aria-hidden="true" />;
}

export function Logo({ className, imgClassName }: { className?: string; imgClassName?: string }) {
  // A logo set in the CMS (Cloudinary URL) overrides; otherwise the bundled
  // Civic Wise lockup is used.
  const logo = useSetting<string>("brand_logo_url");
  const src = logo.data || "/images/civic-wise-logo.png";
  return (
    <Link to="/" className={cn("flex items-center", className)} aria-label="Civic Wise home">
      <img src={src} alt="Civic Wise" className={cn("h-9 w-auto md:h-10", imgClassName)} />
    </Link>
  );
}

/** Returns a callback ref that adds `is-in` to the element once it scrolls into
    view, so CSS reveal transitions (.db-reveal, .db-draw) play. A callback ref
    (not useRef) so it attaches correctly even when the element mounts later,
    e.g. after a loading state. One-shot. */
export function useReveal<T extends HTMLElement = HTMLDivElement>(opts?: { threshold?: number }) {
  const threshold = opts?.threshold ?? 0.12;
  const cleanup = useRef<(() => void) | undefined>(undefined);
  return useCallback((el: T | null) => {
    cleanup.current?.();
    cleanup.current = undefined;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { el.classList.add("is-in"); return; }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) { el.classList.add("is-in"); io.disconnect(); }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    cleanup.current = () => io.disconnect();
  }, [threshold]);
}

/** Map a course icon name or category/legacy key to a scene id. */
function motifScene(kind?: string | null): string {
  const k = (kind ?? "").toLowerCase();
  const map: Record<string, string> = {
    // course icon_name values
    smartphone: "phone", shieldcheck: "shield", messagecircle: "chat",
    searchcheck: "factcheck", wallet: "wallet", briefcase: "briefcase",
    store: "shop", users: "people", building2: "office", filesearch: "docsearch",
    landmark: "columns", coins: "coins", scale: "scale", globe: "globe",
    // legacy / category / home-grid keys
    phone: "phone", shield: "shield", safety: "shield", money: "wallet",
    work: "briefcase", business: "shop", communication: "chat", radio: "radio",
    community: "people", citizenship: "columns", circle: "dots",
  };
  return map[k] ?? "dots";
}

/** Flat SVG illustrations in the brand palette, one scene per topic. */
export function Motif({ kind, className }: { kind?: string | null | undefined; className?: string }) {
  const s = motifScene(kind);
  return (
    <svg viewBox="0 0 200 140" className={className} role="img" aria-label="Illustration" preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="140" className="fill-primary-soft" />
      <circle cx="30" cy="28" r="12" className="fill-accent" opacity=".5" />
      <circle cx="172" cy="112" r="16" className="fill-primary" opacity=".18" />

      {s === "phone" && (
        <g>
          <rect x="74" y="18" width="52" height="104" rx="10" className="fill-primary" />
          <rect x="80" y="28" width="40" height="78" rx="4" className="fill-background" />
          <circle cx="100" cy="114" r="4" className="fill-accent" />
          <rect x="86" y="40" width="28" height="6" rx="3" className="fill-accent" />
          <rect x="86" y="52" width="20" height="6" rx="3" className="fill-primary" opacity=".4" />
          <rect x="86" y="64" width="24" height="6" rx="3" className="fill-primary" opacity=".4" />
        </g>
      )}
      {s === "shield" && (
        <g>
          <path d="M100 16 L140 32 V66 C140 92 122 110 100 120 C78 110 60 92 60 66 V32 Z" className="fill-primary" />
          <path d="M84 66 L96 78 L118 54" className="stroke-accent" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
      {s === "chat" && (
        <g>
          <rect x="40" y="36" width="80" height="52" rx="12" className="fill-primary" />
          <path d="M60 88 L60 104 L80 88 Z" className="fill-primary" />
          <circle cx="64" cy="62" r="5" className="fill-background" />
          <circle cx="80" cy="62" r="5" className="fill-background" />
          <circle cx="96" cy="62" r="5" className="fill-background" />
          <rect x="104" y="60" width="56" height="40" rx="12" className="fill-accent" />
          <path d="M140 100 L140 112 L124 100 Z" className="fill-accent" />
        </g>
      )}
      {s === "factcheck" && (
        <g>
          <rect x="58" y="26" width="64" height="84" rx="6" className="fill-background" stroke="" />
          <rect x="68" y="40" width="44" height="6" rx="3" className="fill-primary" opacity=".35" />
          <rect x="68" y="54" width="34" height="6" rx="3" className="fill-primary" opacity=".35" />
          <rect x="68" y="68" width="40" height="6" rx="3" className="fill-primary" opacity=".35" />
          <circle cx="120" cy="92" r="24" className="fill-none stroke-primary" strokeWidth="7" />
          <path d="M110 92 l7 7 l14 -16" className="stroke-accent" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="136" y="108" width="22" height="9" rx="4" transform="rotate(45 136 108)" className="fill-primary" />
        </g>
      )}
      {s === "wallet" && (
        <g>
          <rect x="52" y="44" width="96" height="60" rx="10" className="fill-primary" />
          <rect x="52" y="58" width="96" height="14" className="fill-primary" />
          <rect x="112" y="68" width="42" height="24" rx="6" className="fill-background" />
          <circle cx="132" cy="80" r="6" className="fill-accent" />
          <circle cx="86" cy="34" r="16" className="fill-accent" />
          <text x="86" y="40" textAnchor="middle" className="fill-primary" fontSize="16" fontWeight="700">K</text>
        </g>
      )}
      {s === "briefcase" && (
        <g>
          <rect x="52" y="52" width="96" height="60" rx="8" className="fill-primary" />
          <rect x="80" y="38" width="40" height="18" rx="6" className="fill-none stroke-primary" strokeWidth="6" />
          <rect x="52" y="74" width="96" height="8" className="fill-background" opacity=".5" />
          <rect x="92" y="70" width="16" height="16" rx="3" className="fill-accent" />
        </g>
      )}
      {s === "shop" && (
        <g>
          <path d="M50 52 L58 34 H142 L150 52 Z" className="fill-accent" />
          <rect x="54" y="52" width="92" height="58" className="fill-primary" />
          <rect x="88" y="78" width="24" height="32" className="fill-background" />
          <rect x="64" y="64" width="22" height="16" rx="2" className="fill-background" opacity=".7" />
          <rect x="114" y="64" width="22" height="16" rx="2" className="fill-background" opacity=".7" />
        </g>
      )}
      {s === "people" && (
        <g>
          <circle cx="100" cy="52" r="15" className="fill-primary" />
          <path d="M72 108 a28 28 0 0 1 56 0 Z" className="fill-primary" />
          <circle cx="60" cy="62" r="12" className="fill-accent" />
          <path d="M40 106 a20 20 0 0 1 40 0 Z" className="fill-accent" />
          <circle cx="140" cy="62" r="12" className="fill-primary" opacity=".6" />
          <path d="M120 106 a20 20 0 0 1 40 0 Z" className="fill-primary" opacity=".6" />
        </g>
      )}
      {s === "office" && (
        <g>
          <rect x="60" y="34" width="80" height="80" className="fill-primary" />
          <rect x="88" y="90" width="24" height="24" className="fill-background" />
          {[44, 66, 88].map((y) => [72, 92, 112].map((x) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="12" height="12" className="fill-background" opacity=".8" />
          )))}
          <rect x="56" y="28" width="88" height="8" className="fill-accent" />
        </g>
      )}
      {s === "docsearch" && (
        <g>
          <rect x="56" y="24" width="60" height="84" rx="6" className="fill-background" />
          <rect x="66" y="38" width="40" height="6" rx="3" className="fill-primary" opacity=".35" />
          <rect x="66" y="52" width="40" height="6" rx="3" className="fill-primary" opacity=".35" />
          <rect x="66" y="66" width="28" height="6" rx="3" className="fill-primary" opacity=".35" />
          <circle cx="118" cy="86" r="22" className="fill-none stroke-primary" strokeWidth="7" />
          <rect x="132" y="100" width="22" height="9" rx="4" transform="rotate(45 132 100)" className="fill-accent" />
        </g>
      )}
      {s === "columns" && (
        <g>
          <path d="M100 22 L150 44 H50 Z" className="fill-accent" />
          {[62, 86, 110, 134].map((x) => <rect key={x} x={x} y="48" width="10" height="52" className="fill-primary" />)}
          <rect x="52" y="44" width="96" height="6" className="fill-primary" />
          <rect x="48" y="100" width="104" height="10" className="fill-primary" />
        </g>
      )}
      {s === "coins" && (
        <g>
          {[96, 78, 60].map((y, i) => (
            <g key={y}>
              <ellipse cx="100" cy={y} rx="34" ry="12" className={i === 1 ? "fill-accent" : "fill-primary"} />
            </g>
          ))}
          <text x="100" y="66" textAnchor="middle" className="fill-primary" fontSize="14" fontWeight="700">K</text>
        </g>
      )}
      {s === "scale" && (
        <g stroke="" >
          <rect x="97" y="32" width="6" height="74" className="fill-primary" />
          <rect x="72" y="100" width="56" height="8" rx="4" className="fill-primary" />
          <path d="M60 44 H140" className="stroke-primary" strokeWidth="6" strokeLinecap="round" />
          <circle cx="100" cy="40" r="7" className="fill-accent" />
          <path d="M60 44 L48 72 H72 Z" className="fill-primary" opacity=".7" />
          <path d="M140 44 L128 72 H152 Z" className="fill-accent" opacity=".85" />
        </g>
      )}
      {s === "globe" && (
        <g fill="none" strokeLinecap="round">
          <circle cx="100" cy="68" r="40" className="fill-primary" />
          <ellipse cx="100" cy="68" rx="16" ry="40" className="stroke-background" strokeWidth="4" />
          <path d="M60 68 H140 M66 48 H134 M66 88 H134" className="stroke-background" strokeWidth="4" />
          <circle cx="100" cy="68" r="40" className="stroke-accent" strokeWidth="4" />
        </g>
      )}
      {s === "radio" && (
        <g fill="none" strokeWidth="5" strokeLinecap="round">
          <circle cx="100" cy="100" r="8" className="fill-primary stroke-none" />
          <path d="M78 82 a30 30 0 0 1 44 0" className="stroke-primary" />
          <path d="M62 66 a52 52 0 0 1 76 0" className="stroke-accent" />
          <path d="M46 50 a74 74 0 0 1 108 0" className="stroke-primary" opacity=".5" />
        </g>
      )}
      {s === "dots" && (
        <g>
          <circle cx="100" cy="70" r="44" className="fill-none stroke-primary" strokeWidth="4" strokeDasharray="6 8" />
          {[0, 60, 120, 180, 240, 300].map((a, i) => (
            <circle key={a} cx={100 + 44 * Math.cos((a * Math.PI) / 180)} cy={70 + 44 * Math.sin((a * Math.PI) / 180)} r="11" className={i % 2 ? "fill-accent" : "fill-primary"} />
          ))}
          <circle cx="100" cy="70" r="16" className="fill-accent" />
        </g>
      )}
    </svg>
  );
}

/** Admin-uploaded image, or an SVG motif fallback. `icon` (a course's icon
    name) is preferred over `motif` (category slug) so each course gets a
    distinct illustration; both fall back gracefully inside Motif. */
export function ContentImage({ src, motif, icon, alt, className }: { src?: string | null; motif?: string | null | undefined; icon?: string | null | undefined; alt: string; className?: string }) {
  if (src) return <img src={src} alt={alt} loading="lazy" className={cn("h-full w-full object-cover", className)} />;
  return <Motif kind={icon || motif} className={cn("h-full w-full", className)} />;
}

function LangToggle() {
  const { lang, setLang } = useI18n();
  return (
    <div role="group" aria-label="Language" className="flex rounded-full border border-border bg-card p-1">
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          aria-pressed={lang === l.code}
          aria-label={l.name}
          className={cn(
            "min-h-9 min-w-11 rounded-full px-2 text-xs font-semibold transition-colors",
            lang === l.code ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

/** Compact language dropdown: shows the current code + chevron, opens a menu. */
function LangMenu() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onEsc); };
  }, [open]);
  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0]!;
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Change language"
        className="inline-flex h-10 items-center gap-1 rounded-full border border-border bg-card px-3 text-sm font-semibold text-foreground transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {current.label}
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform duration-200", open && "rotate-180")} aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-xl border border-border bg-card p-1 shadow-lg">
          {LANGS.map((l) => (
            <button
              key={l.code}
              role="menuitemradio"
              aria-checked={l.code === lang}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-secondary",
                l.code === lang ? "font-semibold text-primary" : "text-foreground",
              )}
            >
              {l.name}
              {l.code === lang && <Check className="size-4" aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Full-width mega menu panel for Courses: pathway columns plus a visual
    supporter column that previews the course the pointer is on. */
function CoursesMega({ onNavigate, setHi, hi }: { onNavigate: () => void; setHi: (c: Course | null) => void; hi: Course | null }) {
  const { t } = useI18n();
  const courses = usePublishedCourses();
  const pathways = usePathways();
  const byPath: Record<string, Course[]> = {};
  for (const c of courses.data ?? []) {
    const s = c.pathway?.slug ?? "other";
    (byPath[s] ??= []).push(c);
  }
  const ordered = (pathways.data ?? [])
    .filter((p) => byPath[p.slug])
    .map((p) => ({ slug: p.slug, title: p.title, courses: byPath[p.slug]!.slice(0, 4) }));
  const featured = hi ?? courses.data?.find((c) => c.difficulty === "start_here") ?? courses.data?.[0] ?? null;
  return (
    <div className="grid grid-cols-4 gap-6 rounded-2xl border border-border/60 bg-background/95 p-6 shadow-xl backdrop-blur-xl">
      {ordered.map((p) => (
        <div key={p.slug}>
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-primary">{p.title}</p>
          <ul className="space-y-0.5">
            {p.courses.map((c) => (
              <li key={c.id}>
                <Link to="/courses/$slug" params={{ slug: c.slug }} onClick={onNavigate} onMouseEnter={() => setHi(c)} onFocus={() => setHi(c)}
                  className="block rounded-lg px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-secondary hover:text-primary">
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-primary">{t("mega.browse", "Browse")}</p>
        <ul className="space-y-0.5">
          <li><Link to="/courses" onClick={onNavigate} className="block rounded-lg px-3 py-2 text-sm font-semibold text-primary hover:bg-secondary">{t("home.courses.all", "All courses")}</Link></li>
          <li><Link to="/for-trainers" onClick={onNavigate} className="block rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-secondary hover:text-primary">{t("nav.trainers", "For Trainers")}</Link></li>
        </ul>
      </div>
      {featured && (
        <Link to="/courses/$slug" params={{ slug: featured.slug }} onClick={onNavigate}
          className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
          <div className="h-24 overflow-hidden bg-primary-soft/50"><Motif kind={featured.icon_name} className="h-full w-full" /></div>
          <div className="p-3">
            <p className="font-display text-sm font-bold leading-snug text-primary">{featured.title}</p>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{featured.tagline}</p>
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">{t("mega.open", "Open course")}<ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" /></span>
          </div>
        </Link>
      )}
    </div>
  );
}

export function SiteHeader() {
  const { t } = useI18n();
  const { user, isStaff, isTrainer, signOut } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);
  const [hi, setHi] = useState<Course | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const megaTimer = useRef<number | null>(null);
  const openMega = () => { if (megaTimer.current) { clearTimeout(megaTimer.current); megaTimer.current = null; } setMega(true); };
  const closeMega = () => { megaTimer.current = window.setTimeout(() => setMega(false), 130); };

  // Close the mobile panel on outside click or Escape; Escape also closes the mega menu.
  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (open && headerRef.current && !headerRef.current.contains(e.target as Node)) setOpen(false); };
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); setMega(false); } };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onEsc); };
  }, [open]);

  const doSignOut = async () => {
    setOpen(false);
    await qc.cancelQueries();
    qc.clear();
    await signOut();
    navigate({ to: "/signin", replace: true });
  };

  const navLinks = [
    { to: "/courses", label: t("nav.courses", "Courses") },
    { to: "/about", label: t("nav.about", "About") },
  ] as const;

  const linkBase =
    "relative flex items-center py-2 text-[15px] font-medium text-foreground/80 transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:text-primary after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:scale-x-0 after:bg-primary after:transition-transform after:duration-200";
  const activeLink = "text-primary after:scale-x-100";
  const mobileLink =
    "flex min-h-11 items-center rounded-xl px-3 text-[15px] font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:bg-secondary";

  return (
    <header ref={headerRef} className="sticky top-0 z-40 px-3 pt-3">
      <div className="container-page">
        {/* Floating bar: rounded, 8px padding, translucent with background blur
            so page content blurs behind it while staying readable. */}
        <div
          className="relative flex items-center justify-between gap-6 rounded-2xl border border-border/60 bg-background/70 p-2 pl-4 shadow-lg backdrop-blur-xl supports-[backdrop-filter]:bg-background/55"
          onMouseLeave={closeMega}
        >
          <Logo />

          {/* Desktop navigation */}
          <nav aria-label="Main" className="hidden items-center gap-7 md:flex">
            <button
              type="button"
              className={cn(linkBase, "gap-1", mega && activeLink)}
              aria-haspopup="true"
              aria-expanded={mega}
              onMouseEnter={openMega}
              onFocus={openMega}
              onClick={() => setMega((v) => !v)}
            >
              {t("nav.courses", "Courses")}
              <ChevronDown className={cn("size-4 transition-transform duration-200", mega && "rotate-180")} aria-hidden="true" />
            </button>
            <Link to="/about" className={linkBase} activeProps={{ className: activeLink }} onMouseEnter={() => setMega(false)}>
              {t("nav.about", "About")}
            </Link>
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2 md:flex">
            <LangMenu />
            {user ? (
              <>
                {isStaff && <Button asChild variant="ghost" size="sm"><Link to="/admin"><ShieldCheck />Admin</Link></Button>}
                {isTrainer && <Button asChild variant="ghost" size="sm"><Link to="/trainer"><Users />{t("nav.trainers", "For Trainers")}</Link></Button>}
                <Button asChild variant="ghost" size="sm"><Link to="/dashboard"><LayoutDashboard />{t("nav.dashboard", "My learning")}</Link></Button>
                <Button asChild variant="ghost" size="icon" aria-label={t("nav.settings", "Settings")}><Link to="/settings"><Settings /></Link></Button>
                <Button variant="ghost" size="icon" onClick={doSignOut} aria-label={t("nav.signout", "Sign out")}><LogOut /></Button>
              </>
            ) : (
              /* Single CTA: elevated gold fill with a rotating conic-gradient bloom. */
              <Link to="/signin" className="db-glow-cta inline-flex h-11 items-center gap-1.5 rounded-full bg-accent px-6 text-[15px] font-semibold text-accent-foreground">
                {t("nav.signin", "Sign in")}<ArrowRight className="size-4" />
              </Link>
            )}
          </div>

          {/* Mobile: hamburger only */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t("nav.closemenu", "Close menu") : t("nav.openmenu", "Open menu")}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X /> : <Menu />}
          </Button>

          {/* Courses mega menu: flush to the full width of the floating bar */}
          {mega && (
            <div className="absolute inset-x-0 top-full z-50 hidden pt-3 md:block" onMouseEnter={openMega} onMouseLeave={closeMega}>
              <CoursesMega onNavigate={() => setMega(false)} setHi={setHi} hi={hi} />
            </div>
          )}
        </div>
      </div>

      {/* Mobile panel: floating rounded card below the bar */}
      {open && (
        <div id="mobile-menu" className="container-page mt-2 md:hidden">
          <div className="rounded-2xl border border-border/60 bg-background/90 p-2 shadow-lg backdrop-blur-xl">
            <nav aria-label="Mobile" className="flex flex-col gap-0.5">
              {navLinks.map((l) => (
                <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className={mobileLink} activeProps={{ className: "text-primary" }}>
                  {l.label}
                </Link>
              ))}
              {user && (
                <>
                  {isStaff && <Link to="/admin" onClick={() => setOpen(false)} className={mobileLink}>Admin</Link>}
                  {isTrainer && <Link to="/trainer" onClick={() => setOpen(false)} className={mobileLink}>{t("nav.trainers", "For Trainers")}</Link>}
                  <Link to="/dashboard" onClick={() => setOpen(false)} className={mobileLink}>{t("nav.dashboard", "My learning")}</Link>
                  <Link to="/settings" onClick={() => setOpen(false)} className={mobileLink}>{t("nav.settings", "Settings")}</Link>
                </>
              )}
              <div className="my-2 h-px bg-border" />
              {user ? (
                <div className="flex items-center justify-between gap-3 px-1 pb-1">
                  <LangToggle />
                  <button onClick={doSignOut} className="inline-flex min-h-11 items-center rounded-full px-4 text-[15px] font-semibold text-foreground/80 transition-colors hover:text-primary">
                    {t("nav.signout", "Sign out")}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 px-1 pb-1">
                  <Link to="/signin" onClick={() => setOpen(false)} className="db-glow-cta inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-accent px-5 text-[15px] font-semibold text-accent-foreground">
                    {t("nav.signin", "Sign in")}<ArrowRight className="size-4" />
                  </Link>
                  <div className="pt-1"><LangToggle /></div>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  const { openManager } = useConsent();
  const { t } = useI18n();
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-page grid gap-8 py-12 text-center md:grid-cols-4 md:text-left">
        <div className="flex flex-col items-center md:col-span-2 md:items-start">
          <Logo className="w-fit rounded-xl bg-white px-3 py-2 shadow-sm" />
          <p className="mt-3 max-w-sm text-sm text-primary-foreground/70">
            {t("footer.tagline", "Free digital skills lessons for communities across Zambia.")}
          </p>
          <p className="mt-2 max-w-sm text-xs text-primary-foreground/60">{t("note.translations", "Lesson translations are rolling out. Menus are translated now.")}</p>
        </div>
        <nav aria-label="Learn" className="flex flex-col items-center gap-2 text-sm md:items-start">
          <span className="font-semibold text-accent">{t("footer.learn", "Learn")}</span>
          <Link to="/courses" className="text-primary-foreground/70 transition-colors duration-200 hover:text-primary-foreground">{t("nav.courses", "Courses")}</Link>
          <Link to="/about" className="text-primary-foreground/70 transition-colors duration-200 hover:text-primary-foreground">{t("nav.about", "About")}</Link>
          <Link to="/for-trainers" className="text-primary-foreground/70 transition-colors duration-200 hover:text-primary-foreground">{t("nav.trainers", "For Trainers")}</Link>
          <Link to="/contact" className="text-primary-foreground/70 transition-colors duration-200 hover:text-primary-foreground">{t("footer.contact", "Contact")}</Link>
        </nav>
        <nav aria-label="Legal" className="flex flex-col items-center gap-2 text-sm md:items-start">
          <span className="font-semibold text-accent">{t("footer.yourdata", "Your data")}</span>
          <Link to="/privacy" className="text-primary-foreground/70 transition-colors duration-200 hover:text-primary-foreground">{t("footer.privacy", "Privacy")}</Link>
          <Link to="/terms" className="text-primary-foreground/70 transition-colors duration-200 hover:text-primary-foreground">{t("footer.terms", "Terms")}</Link>
          <Link to="/accessibility" className="text-primary-foreground/70 transition-colors duration-200 hover:text-primary-foreground">{t("footer.accessibility", "Accessibility")}</Link>
          <button onClick={openManager} className="text-primary-foreground/70 transition-colors duration-200 hover:text-primary-foreground">{t("footer.cookies", "Cookie settings")}</button>
        </nav>
      </div>
      <div className="border-t border-primary-foreground/15">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-primary-foreground/70 sm:flex-row">
          <p>© {new Date().getFullYear()} Civic Wise. {t("footer.rights", "All rights reserved.")}</p>
          <p>
            {t("footer.developedby", "Developed by")}{" "}
            <a href="https://zcsi-foundation.org" target="_blank" rel="noreferrer" className="font-semibold text-accent hover:underline">
              Zambia Cyber Security Foundation
            </a>{" "}
            {t("footer.initiative", "initiative")}
          </p>
        </div>
      </div>
    </footer>
  );
}

export function FeatureStrip() {
  const { t } = useI18n();
  const items = [
    { icon: Clock, title: t("feat.pace.title", "Learn at your own pace"), body: t("feat.pace.body", "Short lessons you can finish between other things, no deadlines.") },
    { icon: Smartphone, title: t("feat.device.title", "Works on any device"), body: t("feat.device.body", "Built for the phone in your pocket, from the oldest handset up.") },
    { icon: WifiOff, title: t("feat.data.title", "Low data friendly"), body: t("feat.data.body", "Light pages and offline packs so you spend less on bundles.") },
    { icon: GraduationCap, title: t("feat.skills.title", "Build real skills"), body: t("feat.skills.body", "Practical digital and civic know-how you can use the same day.") },
  ];
  return (
    <section aria-label={t("feat.aria", "Why learn with us")} className="border-y border-border bg-secondary/30">
      <div className="container-page grid gap-8 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.title} className="flex flex-col items-center text-center sm:items-start sm:text-left">
            <span className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">
              <it.icon className="size-6" aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-display text-lg font-bold text-foreground">{it.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{it.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2">Skip to content</a>
      <OfflineBar />
      <SiteHeader />
      <main id="main" className="flex-1">{children}</main>
      <SiteFooter />
      <AssistantWidget />
    </div>
  );
}

export function EmptyState({ icon = "Inbox", title, body, action }: { icon?: string; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-8">
      <Icon name={icon} className="size-8 text-primary" />
      <h3 className="mt-3 text-lg">{title}</h3>
      <p className="mt-1 max-w-md text-muted-foreground">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorNote({ message = "We could not load this. Check your connection and try again." }: { message?: string }) {
  return (
    <div role="alert" className="rounded-2xl border border-destructive/30 bg-card p-6 text-destructive">
      <WifiOff className="mb-2 size-6" aria-hidden="true" />
      {message}
    </div>
  );
}

export function CardsSkeleton({ n = 4 }: { n?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: n }).map((_, i) => (
        <Skeleton key={i} className="h-64 rounded-2xl" />
      ))}
    </div>
  );
}

export function CourseCard({ course, progress }: { course: Course; index?: number; progress?: number | undefined }) {
  const { t } = useI18n();
  const lessons = course.lessons?.length ?? 0;
  return (
    <Link
      to="/courses/$slug"
      params={{ slug: course.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-[transform,box-shadow,border-color] duration-300 ease-out hover:border-primary/40 hover:shadow-lg motion-safe:hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="relative h-44 overflow-hidden bg-primary-soft/50">
        <ContentImage
          src={course.image_url}
          icon={course.icon_name}
          motif={course.categories?.slug}
          alt=""
          className="motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out motion-safe:group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-bold leading-snug text-primary">{course.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{course.tagline}</p>
        <div className="mt-6 flex items-end justify-between gap-3">
          <p className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {course.categories?.name && <span className="font-semibold text-primary">{course.categories.name}</span>}
            <span>{lessons} {t("course.lessons", "lessons")}</span>
            <span>{course.estimated_hours} {t("course.hrs", "hrs")}</span>
          </p>
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">
            <ArrowRight className="size-5" />
          </span>
        </div>
        {progress !== undefined && progress > 0 && (
          <div className="mt-4" aria-label={`${progress}% complete`}>
            <div className="h-2 rounded-full bg-secondary">
              <div className="h-2 rounded-full bg-success" style={{ width: `${progress}%` }} />
            </div>
            <span className="mt-1 block text-xs text-muted-foreground">{progress}% done</span>
          </div>
        )}
      </div>
    </Link>
  );
}

export function RichText({ text }: { text: string }) {
  const blocks = text.split(/\n\s*\n/).filter((b) => b.trim());
  const inline = (s: string) =>
    s.split(/(\*\*[^*]+\*\*)/g).map((p, i) => (p.startsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>));
  return (
    <div className="prose-lesson">
      {blocks.map((b, i) => {
        const lines = b.split("\n");
        if (lines.every((l) => l.trim().startsWith("- ")))
          return <ul key={i}>{lines.map((l, j) => <li key={j}>{inline(l.trim().slice(2))}</li>)}</ul>;
        if (lines[0]?.startsWith("## "))
          return (
            <div key={i}>
              <h2>{lines[0].slice(3)}</h2>
              {lines.slice(1).join(" ").trim() && <p>{inline(lines.slice(1).join(" "))}</p>}
            </div>
          );
        return <p key={i}>{inline(b.replace(/\n/g, " "))}</p>;
      })}
    </div>
  );
}

export function ProgressRing({ value, size = 120 }: { value: number; size?: number }) {
  const r = (size - 14) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} role="img" aria-label={`${value}% of all lessons completed`}>
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth="12" className="fill-none stroke-secondary" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        strokeWidth="12"
        strokeLinecap="round"
        className="fill-none stroke-success"
        strokeDasharray={c}
        strokeDashoffset={c - (c * value) / 100}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="fill-foreground font-display text-2xl font-extrabold">
        {value}%
      </text>
    </svg>
  );
}

export function BadgeMedal({ icon, earned, label }: { icon: string; earned: boolean; label: string }) {
  return (
    <div className="flex w-24 flex-col items-center gap-2 text-center">
      <svg viewBox="0 0 64 64" className={cn("size-16", !earned && "opacity-30 grayscale")} aria-hidden="true">
        <polygon points="32,2 58,17 58,47 32,62 6,47 6,17" className={earned ? "fill-accent" : "fill-secondary"} />
        <polygon points="32,10 51,21 51,43 32,54 13,43 13,21" className="fill-primary" />
      </svg>
      <Icon name={icon} className={cn("-mt-[3.25rem] mb-6 size-6", earned ? "text-accent" : "text-muted-foreground")} />
      <span className="text-xs font-semibold">{label}</span>
      <span className="sr-only">{earned ? "Earned" : "Not earned yet"}</span>
    </div>
  );
}

export function PageHero({ eyebrow, title, sub }: { eyebrow?: string | undefined; title: string; sub?: string | undefined }) {
  return (
    <section className="container-page pb-8 pt-12 md:pt-16">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="mt-2 max-w-3xl text-3xl md:text-5xl">{title}</h1>
      {sub && <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{sub}</p>}
    </section>
  );
}
