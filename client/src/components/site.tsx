import { Link, useNavigate } from "@tanstack/react-router";
import {
  Menu, X, LogOut, LayoutDashboard, Settings, ShieldCheck, Clock, BookOpen, WifiOff,
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
import { useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { useI18n, LANGS } from "@/lib/i18n";
import { useConsent } from "@/lib/consent";
import { difficultyLabel, type Course } from "@/lib/content";
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

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("flex items-center", className)} aria-label="Digital Bridges home">
      <img src="/images/logo.png" alt="Digital Bridges" className="h-9 w-auto md:h-10" width={188} height={40} />
    </Link>
  );
}

/** Geometric SVG motifs in palette colours. */
export function Motif({ kind, className }: { kind?: string | null | undefined; className?: string }) {
  const k = kind ?? "circle";
  return (
    <svg viewBox="0 0 200 140" className={className} role="img" aria-label="Illustration" preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="140" className="fill-primary-soft" />
      {(k === "radio" || k === "communication" || k === "citizenship") && (
        <g fill="none" strokeWidth="5" strokeLinecap="round">
          <circle cx="100" cy="100" r="8" className="fill-primary stroke-none" />
          <path d="M78 82 a30 30 0 0 1 44 0" className="stroke-primary" />
          <path d="M62 66 a52 52 0 0 1 76 0" className="stroke-accent" />
          <path d="M46 50 a74 74 0 0 1 108 0" className="stroke-primary" opacity=".5" />
        </g>
      )}
      {(k === "phone" || k === "money" || k === "work") && (
        <g>
          <rect x="74" y="18" width="52" height="96" rx="10" className="fill-primary" />
          <rect x="80" y="28" width="40" height="70" rx="4" className="fill-background" />
          <circle cx="100" cy="106" r="4" className="fill-accent" />
          <rect x="86" y="40" width="28" height="6" rx="3" className="fill-accent" />
          <rect x="86" y="52" width="20" height="6" rx="3" className="fill-primary" opacity=".4" />
          <rect x="86" y="64" width="24" height="6" rx="3" className="fill-primary" opacity=".4" />
          <circle cx="150" cy="40" r="14" className="fill-accent" opacity=".8" />
          <circle cx="44" cy="100" r="10" className="fill-primary" opacity=".3" />
        </g>
      )}
      {(k === "shield" || k === "safety") && (
        <g>
          <path d="M100 16 L140 32 V66 C140 92 122 110 100 120 C78 110 60 92 60 66 V32 Z" className="fill-primary" />
          <path d="M84 66 L96 78 L118 54" className="stroke-accent" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="40" cy="36" r="10" className="fill-accent" opacity=".6" />
          <circle cx="166" cy="104" r="14" className="fill-primary" opacity=".25" />
        </g>
      )}
      {(k === "community" || k === "business" || k === "circle") && (
        <g>
          <circle cx="100" cy="70" r="44" className="fill-none stroke-primary" strokeWidth="4" strokeDasharray="6 8" />
          {[0, 60, 120, 180, 240, 300].map((a, i) => (
            <circle
              key={a}
              cx={100 + 44 * Math.cos((a * Math.PI) / 180)}
              cy={70 + 44 * Math.sin((a * Math.PI) / 180)}
              r="11"
              className={i % 2 ? "fill-accent" : "fill-primary"}
            />
          ))}
          <circle cx="100" cy="70" r="16" className="fill-accent" />
        </g>
      )}
    </svg>
  );
}

/** Admin-uploaded image, or an SVG motif fallback keyed by category/motif. */
export function ContentImage({ src, motif, alt, className }: { src?: string | null; motif?: string | null | undefined; alt: string; className?: string }) {
  if (src) return <img src={src} alt={alt} loading="lazy" className={cn("h-full w-full object-cover", className)} />;
  return <Motif kind={motif} className={cn("h-full w-full", className)} />;
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

export function SiteHeader() {
  const { t } = useI18n();
  const { user, isStaff, signOut } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const links = [
    { to: "/courses", label: t("nav.courses", "Courses") },
    { to: "/about", label: t("nav.about", "About") },
    { to: "/trainer", label: t("nav.trainers", "For Trainers") },
  ] as const;
  const doSignOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await signOut();
    navigate({ to: "/signin", replace: true });
  };
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-secondary" activeProps={{ className: "bg-secondary" }}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <LangToggle />
          {user ? (
            <>
              {isStaff && <Button asChild variant="ghost" size="sm"><Link to="/admin"><ShieldCheck />Admin</Link></Button>}
              <Button asChild variant="ghost" size="sm"><Link to="/dashboard"><LayoutDashboard />{t("nav.dashboard", "My learning")}</Link></Button>
              <Button asChild variant="ghost" size="icon" aria-label={t("nav.settings", "Settings")}><Link to="/settings"><Settings /></Link></Button>
              <Button variant="ghost" size="icon" onClick={doSignOut} aria-label={t("nav.signout", "Sign out")}><LogOut /></Button>
            </>
          ) : (
            <Button asChild variant="accent"><Link to="/signin">{t("nav.signin", "Sign in")}</Link></Button>
          )}
        </div>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </Button>
      </div>
      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav aria-label="Mobile" className="container-page flex flex-col gap-1 py-4" onClick={() => setOpen(false)}>
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="rounded-xl px-4 py-3 font-medium hover:bg-secondary">{l.label}</Link>
            ))}
            {user ? (
              <>
                <Link to="/dashboard" className="rounded-xl px-4 py-3 font-medium hover:bg-secondary">{t("nav.dashboard", "My learning")}</Link>
                <Link to="/settings" className="rounded-xl px-4 py-3 font-medium hover:bg-secondary">{t("nav.settings", "Settings")}</Link>
                <button onClick={doSignOut} className="rounded-xl px-4 py-3 text-left font-medium hover:bg-secondary">{t("nav.signout", "Sign out")}</button>
              </>
            ) : (
              <div className="px-4 pt-2">
                <Button asChild variant="accent" className="w-full"><Link to="/signin">{t("nav.signin", "Sign in")}</Link></Button>
              </div>
            )}
          </nav>
          <div className="container-page pb-4" onClick={(e) => e.stopPropagation()}><LangToggle /></div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  const { openManager } = useConsent();
  const { t } = useI18n();
  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="container-page grid gap-8 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Free digital skills lessons for communities across Zambia.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{t("note.translations", "Lesson translations are rolling out. Menus are translated now.")}</p>
        </div>
        <nav aria-label="Learn" className="flex flex-col gap-2 text-sm">
          <span className="font-semibold">Learn</span>
          <Link to="/courses" className="text-muted-foreground transition-colors duration-200 hover:text-foreground">Courses</Link>
          <Link to="/about" className="text-muted-foreground transition-colors duration-200 hover:text-foreground">About</Link>
          <Link to="/trainer" className="text-muted-foreground transition-colors duration-200 hover:text-foreground">For Trainers</Link>
          <Link to="/contact" className="text-muted-foreground transition-colors duration-200 hover:text-foreground">Contact</Link>
        </nav>
        <nav aria-label="Legal" className="flex flex-col gap-2 text-sm">
          <span className="font-semibold">Your data</span>
          <Link to="/privacy" className="text-muted-foreground transition-colors duration-200 hover:text-foreground">Privacy</Link>
          <Link to="/terms" className="text-muted-foreground transition-colors duration-200 hover:text-foreground">Terms</Link>
          <Link to="/accessibility" className="text-muted-foreground transition-colors duration-200 hover:text-foreground">Accessibility</Link>
          <button onClick={openManager} className="text-left text-muted-foreground hover:text-foreground">Cookie settings</button>
        </nav>
      </div>
    </footer>
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

export function CourseCard({ course, index, progress }: { course: Course; index: number; progress?: number | undefined }) {
  const lessons = course.lessons?.length ?? 0;
  return (
    <Link
      to="/courses/$slug"
      params={{ slug: course.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-[transform,box-shadow,border-color] duration-300 ease-out hover:border-primary/50 hover:shadow-lg motion-safe:hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="relative h-28 overflow-hidden">
        <ContentImage
          src={course.image_url}
          motif={course.categories?.slug}
          alt=""
          className="motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out motion-safe:group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-background px-2.5 py-0.5 font-display text-sm font-extrabold text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2">
          <Icon name={course.icon_name} className="size-5 text-primary" />
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", course.difficulty === "start_here" ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground")}>
            {difficultyLabel[course.difficulty]}
          </span>
        </div>
        <h3 className="mt-3 text-lg transition-colors duration-200 group-hover:text-primary">{course.title}</h3>
        <p className="mt-1 flex-1 text-sm text-muted-foreground">{course.tagline}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><BookOpen className="size-3.5" aria-hidden="true" />{lessons} lessons</span>
          <span className="inline-flex items-center gap-1"><Clock className="size-3.5" aria-hidden="true" />{course.estimated_hours} hrs</span>
          <span className="inline-flex items-center gap-1 text-success"><WifiOff className="size-3.5" aria-hidden="true" />Light on data</span>
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
