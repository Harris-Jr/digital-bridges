import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowRight, BookOpen, GraduationCap, Globe, Gift, LayoutGrid, ListOrdered, Type, Image as ImageIcon, Megaphone,
  Images, PlayCircle, Route as RouteIcon, BarChart3, Library, MessageSquareQuote, HelpCircle, Handshake, Newspaper, Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Icon, Motif, CourseCard, CardsSkeleton, ErrorNote, FeatureStrip, RichText, useReveal } from "@/components/site";
import { Testimonials, Partners, PathwaySelector, FaqSection } from "@/components/home-sections";
import { formatDate, usePathways, usePosts, usePublished, usePublishedCourses } from "@/lib/content";
import { useI18n, LANGS } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/* ==========================================================================
   Page builder blocks.

   A page is a hero plus an ordered list of blocks. Each block has a type, an
   id, an optional hidden flag and a data object. This file is the single
   source of truth for every block type: its name and icon in the editor, the
   fields editors can change, the defaults for a new block, and how it renders.
   ========================================================================== */

export type Block = { id: string; type: string; hidden?: boolean; data: Record<string, any> }; // eslint-disable-line @typescript-eslint/no-explicit-any

export type BlockField =
  | { key: string; label: string; kind: "text" | "textarea" | "richtext" | "image" | "link" | "icon"; help?: string; placeholder?: string }
  | { key: string; label: string; kind: "number"; min?: number; max?: number }
  | { key: string; label: string; kind: "boolean" }
  | { key: string; label: string; kind: "select"; options: { value: string; label: string }[] }
  | { key: string; label: string; kind: "items"; itemLabel: string; fields: BlockField[]; max?: number };

export type BlockDef = {
  label: string;
  description: string;
  icon: LucideIcon;
  group: "Content" | "Live sections";
  fields: BlockField[];
  defaults: Record<string, unknown>;
  render: (data: Record<string, any>, tx: (k: string) => string) => ReactNode; // eslint-disable-line @typescript-eslint/no-explicit-any
};

const heading: BlockField[] = [
  { key: "eyebrow", label: "Small heading", kind: "text", placeholder: "Optional" },
  { key: "title", label: "Title", kind: "text" },
];

export const BLOCKS: Record<string, BlockDef> = {
  /* ------------------------------------------------------------ content */
  text: {
    label: "Text", description: "A heading and paragraphs. Supports lists, links and images.", icon: Type, group: "Content",
    fields: [
      ...heading,
      { key: "body", label: "Text", kind: "richtext" },
      { key: "layout", label: "Layout", kind: "select", options: [{ value: "stack", label: "Title above text" }, { value: "side", label: "Title beside text" }] },
      { key: "align", label: "Alignment", kind: "select", options: [{ value: "left", label: "Left" }, { value: "center", label: "Centre" }] },
      { key: "divider", label: "Line above", kind: "boolean" },
    ],
    defaults: { title: "New section", body: "Write something here.", layout: "stack", align: "left", divider: false },
    render: (d, tx) => <TextBlock d={d} tx={tx} />,
  },
  image_text: {
    label: "Image and text", description: "A picture beside a heading, text and an optional button.", icon: ImageIcon, group: "Content",
    fields: [
      ...heading,
      { key: "body", label: "Text", kind: "richtext" },
      { key: "image", label: "Image", kind: "image" },
      { key: "image_alt", label: "Image description", kind: "text", help: "What the picture shows, for screen readers." },
      { key: "image_side", label: "Image side", kind: "select", options: [{ value: "right", label: "Right" }, { value: "left", label: "Left" }] },
      { key: "button_label", label: "Button text", kind: "text", placeholder: "Optional" },
      { key: "button_href", label: "Button link", kind: "link" },
    ],
    defaults: { title: "A heading", body: "Tell the story here.", image: "", image_side: "right" },
    render: (d, tx) => <ImageTextBlock d={d} tx={tx} />,
  },
  features: {
    label: "Features", description: "Icons with short titles and text, in a grid.", icon: LayoutGrid, group: "Content",
    fields: [
      ...heading,
      { key: "subtitle", label: "Intro", kind: "textarea" },
      { key: "style", label: "Style", kind: "select", options: [{ value: "cards", label: "Cards" }, { value: "plain", label: "Plain list" }] },
      { key: "items", label: "Items", kind: "items", itemLabel: "item", max: 12, fields: [
        { key: "icon", label: "Icon", kind: "icon" },
        { key: "title", label: "Title", kind: "text" },
        { key: "body", label: "Text", kind: "textarea" },
      ] },
    ],
    defaults: { title: "What you get", style: "cards", items: [{ icon: "Lightbulb", title: "First point", body: "Explain it in one sentence." }] },
    render: (d, tx) => <FeaturesBlock d={d} tx={tx} />,
  },
  steps: {
    label: "Steps", description: "Numbered steps, such as how to get started.", icon: ListOrdered, group: "Content",
    fields: [
      ...heading,
      { key: "items", label: "Steps", kind: "items", itemLabel: "step", max: 8, fields: [
        { key: "title", label: "Title", kind: "text" },
        { key: "body", label: "Text", kind: "textarea" },
      ] },
    ],
    defaults: { title: "How it works", items: [{ title: "First step", body: "" }, { title: "Second step", body: "" }, { title: "Third step", body: "" }] },
    render: (d, tx) => <StepsBlock d={d} tx={tx} />,
  },
  cta: {
    label: "Call to action", description: "A bold banner with one or two buttons.", icon: Megaphone, group: "Content",
    fields: [
      { key: "title", label: "Title", kind: "text" },
      { key: "body", label: "Text", kind: "textarea" },
      { key: "primary_label", label: "Main button text", kind: "text" },
      { key: "primary_href", label: "Main button link", kind: "link" },
      { key: "secondary_label", label: "Second button text", kind: "text", placeholder: "Optional" },
      { key: "secondary_href", label: "Second button link", kind: "link" },
    ],
    defaults: { title: "Start learning today", body: "", primary_label: "Start Learning", primary_href: "/signup" },
    render: (d, tx) => <CtaBlock d={d} tx={tx} />,
  },
  gallery: {
    label: "Gallery", description: "A grid of photos with captions.", icon: Images, group: "Content",
    fields: [
      ...heading,
      { key: "images", label: "Photos", kind: "items", itemLabel: "photo", max: 24, fields: [
        { key: "url", label: "Photo", kind: "image" },
        { key: "alt", label: "Caption", kind: "text" },
      ] },
    ],
    defaults: { title: "Gallery", images: [] },
    render: (d, tx) => <GalleryBlock d={d} tx={tx} />,
  },
  video: {
    label: "Video", description: "A YouTube video that loads only when tapped.", icon: PlayCircle, group: "Content",
    fields: [
      ...heading,
      { key: "url", label: "YouTube link", kind: "link" },
      { key: "caption", label: "Caption", kind: "text" },
    ],
    defaults: { title: "Watch", url: "" },
    render: (d, tx) => <VideoBlock d={d} tx={tx} />,
  },

  /* ------------------------------------------------------- live sections */
  pathways: { label: "Pathways", description: "The learning pathways, from Admin, Pathways.", icon: RouteIcon, group: "Live sections", fields: [], defaults: {}, render: () => <PathwaysBlock /> },
  stats: { label: "Live numbers", description: "Course and lesson counts, languages, cost.", icon: BarChart3, group: "Live sections", fields: [], defaults: {}, render: () => <StatsBlock /> },
  courses: {
    label: "Courses", description: "A selection of published courses.", icon: Library, group: "Live sections",
    fields: [...heading, { key: "count", label: "How many", kind: "number", min: 2, max: 12 }],
    defaults: { eyebrow: "Courses", title: "Start with something useful", count: 4 },
    render: (d, tx) => <CoursesBlock d={d} tx={tx} />,
  },
  testimonials: { label: "Testimonials", description: "Published testimonials, from Admin, Testimonials.", icon: MessageSquareQuote, group: "Live sections", fields: [], defaults: {}, render: () => <TestimonialsBlock /> },
  faqs: { label: "FAQs", description: "Published questions, from Admin, FAQs.", icon: HelpCircle, group: "Live sections", fields: [], defaults: {}, render: () => <FaqsBlock /> },
  partners: { label: "Partners", description: "Published partners, from Admin, Partners.", icon: Handshake, group: "Live sections", fields: [], defaults: {}, render: () => <PartnersBlock /> },
  news: {
    label: "Latest news", description: "The newest published news posts.", icon: Newspaper, group: "Live sections",
    fields: [...heading, { key: "count", label: "How many", kind: "number", min: 1, max: 6 }],
    defaults: { eyebrow: "News", title: "Latest updates", count: 3 },
    render: (d, tx) => <NewsBlock d={d} tx={tx} />,
  },
  feature_strip: { label: "Highlights strip", description: "The four short highlights (free, offline, languages, pace).", icon: Sparkles, group: "Live sections", fields: [], defaults: {}, render: () => <FeatureStrip /> },
};

/** Render a page's visible blocks. Unknown block types are skipped. */
export function Blocks({ blocks }: { blocks: Block[] }) {
  const { t } = useI18n();
  return (
    <>
      {blocks.filter((b) => !b.hidden && BLOCKS[b.type]).map((b) => {
        // Text fields that still carry an interface translation key ("t") are
        // shown in the learner's language; edited fields lose their key.
        const tx = (k: string) => {
          const v = b.data[k];
          const key = b.data.t?.[k];
          return key && typeof v === "string" ? t(key, v) : (v ?? "");
        };
        return <div key={b.id} id={`block-${b.id}`}>{BLOCKS[b.type]!.render(b.data, tx)}</div>;
      })}
    </>
  );
}

/* ----------------------------------------------------------------- hero */

/** The standard page hero: eyebrow, title, intro, optional actions, and the
 *  page photo (or an illustration when no photo is set). */
export function PageHero({ eyebrow, title, intro, image, imageAlt, children }: {
  eyebrow?: string; title: string; intro?: string; image?: string | null; imageAlt?: string; children?: ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <section className="container-page grid items-center gap-10 py-12 md:grid-cols-2 md:gap-14 md:py-16">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-3 whitespace-pre-line text-4xl font-extrabold leading-[1.05] text-primary md:text-5xl">{title}</h1>
        {intro && <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">{intro}</p>}
        {children}
      </div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-primary-soft/40 shadow-sm">
        {image && !failed
          ? <img src={image} alt={imageAlt ?? ""} onError={() => setFailed(true)} className="h-full w-full object-cover" />
          : <Motif kind="users" className="h-full w-full" />}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- helpers */

type P = { d: Record<string, any>; tx: (k: string) => string }; // eslint-disable-line @typescript-eslint/no-explicit-any

function SectionHead({ d, tx, center = false }: P & { center?: boolean }) {
  if (!d.eyebrow && !d.title) return null;
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center")}>
      {d.eyebrow && <p className="eyebrow">{tx("eyebrow")}</p>}
      {d.title && <h2 className="mt-2 text-3xl md:text-4xl">{tx("title")}</h2>}
    </div>
  );
}

function SmartLink({ href, children, className, variant, size }: { href: string; children: ReactNode; className?: string; variant?: "accent" | "outline" | "default"; size?: "lg" | "default" }) {
  const internal = href.startsWith("/");
  return (
    <Button asChild variant={variant} size={size} className={className}>
      {internal ? <Link to={href}>{children}</Link> : <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>}
    </Button>
  );
}

const WHY_TONE = [
  "bg-primary-soft text-primary group-hover:bg-primary group-hover:text-primary-foreground",
  "bg-accent-soft text-accent-foreground group-hover:bg-accent group-hover:text-accent-foreground",
];

/** Interleave courses from the two pathways so the shortlist shows a mix. */
function mixPathways<T extends { pathway?: { slug: string } | null }>(all: T[], n: number): T[] {
  const civic = all.filter((c) => c.pathway?.slug === "civic-education");
  const digital = all.filter((c) => c.pathway?.slug !== "civic-education");
  const out: T[] = [];
  for (let i = 0; out.length < n && (i < digital.length || i < civic.length); i++) {
    if (digital[i]) out.push(digital[i]!);
    if (out.length < n && civic[i]) out.push(civic[i]!);
  }
  return out.slice(0, n);
}

const youtubeId = (url: string) => /(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/.exec(url)?.[1] ?? null;

/* ------------------------------------------------------- content blocks */

function TextBlock({ d, tx }: P) {
  const side = d.layout === "side" && d.title;
  return (
    <section className={cn("container-page py-8 md:py-12", d.align === "center" && "text-center")}>
      {d.divider && <hr className="mb-6 border-border" />}
      <div className={cn(side ? "grid gap-4 md:grid-cols-[minmax(0,15rem)_1fr] md:gap-12" : "", d.align === "center" && "mx-auto max-w-2xl")}>
        {(d.eyebrow || d.title) && (
          <div>
            {d.eyebrow && <p className="eyebrow">{tx("eyebrow")}</p>}
            {d.title && <h2 className={cn("text-2xl text-primary md:text-3xl", !side && "mb-4")}>{tx("title")}</h2>}
          </div>
        )}
        {d.body && (
          <div className={cn("max-w-2xl text-lg leading-relaxed text-foreground/80", !d.title && "text-base text-muted-foreground", d.align === "center" && "mx-auto")}>
            {d.t?.body ? <p>{tx("body")}</p> : <RichText text={String(d.body)} />}
          </div>
        )}
      </div>
    </section>
  );
}

function ImageTextBlock({ d, tx }: P) {
  return (
    <section className="container-page py-12 md:py-16">
      <div className={cn("grid items-center gap-10 md:grid-cols-2 md:gap-14", d.image_side === "left" && "md:[&>*:first-child]:order-2")}>
        <div>
          {d.eyebrow && <p className="eyebrow">{tx("eyebrow")}</p>}
          {d.title && <h2 className="mt-2 text-3xl md:text-4xl">{tx("title")}</h2>}
          {d.body && <div className="mt-4 text-lg text-foreground/80"><RichText text={String(d.body)} /></div>}
          {d.button_label && d.button_href && <SmartLink href={d.button_href} variant="accent" className="mt-6">{tx("button_label")}<ArrowRight /></SmartLink>}
        </div>
        {d.image ? (
          <img src={d.image} alt={d.image_alt ?? ""} loading="lazy" className="w-full rounded-2xl border border-border object-cover shadow-sm" />
        ) : (
          <div className="grid aspect-[4/3] place-items-center rounded-2xl border border-dashed border-border bg-secondary text-sm text-muted-foreground">Add an image</div>
        )}
      </div>
    </section>
  );
}

function FeaturesBlock({ d, tx }: P) {
  const { t } = useI18n();
  type Item = { icon?: string; title: string; body: string; t?: Record<string, string> };
  const items: Item[] = (Array.isArray(d.items) ? d.items : []).map((it: Item) => ({
    ...it,
    title: it.t?.title ? t(it.t.title, it.title) : it.title,
    body: it.t?.body ? t(it.t.body, it.body) : it.body,
  }));
  if (d.style === "plain") {
    return (
      <section className="container-page py-8 md:py-12">
        {d.title && <h2 className="text-center text-2xl text-primary md:text-3xl">{tx("title")}</h2>}
        {d.subtitle && <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">{tx("subtitle")}</p>}
        <div className="mx-auto mt-8 grid max-w-4xl gap-x-10 gap-y-8 sm:grid-cols-2">
          {items.map((f, i) => (
            <div key={i} className="flex gap-4">
              <Icon name={f.icon} className="size-7 shrink-0 text-primary" />
              <div><h3 className="text-lg font-semibold">{f.title}</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.body}</p></div>
            </div>
          ))}
        </div>
      </section>
    );
  }
  return (
    <section className="container-page py-16 md:py-20">
      <SectionHead d={d} tx={tx} />
      {d.subtitle && <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{tx("subtitle")}</p>}
      <div className={cn("mt-10 grid gap-5 sm:grid-cols-2", items.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
        {items.map((w, i) => (
          <div key={i} className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-[transform,box-shadow,border-color] duration-300 ease-out hover:border-primary/40 hover:shadow-md motion-safe:hover:-translate-y-1">
            <span className={`grid size-14 place-items-center rounded-2xl transition-colors duration-300 ${WHY_TONE[i % WHY_TONE.length]}`}><Icon name={w.icon} className="size-7" /></span>
            <h3 className="mt-5 text-lg font-semibold">{w.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{w.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* Steps: numbers cascade in as the section scrolls into view. */
function StepsBlock({ d, tx }: P) {
  const steps: { title: string; body: string }[] = Array.isArray(d.items) ? d.items : [];
  const dir = useRef<"down" | "up">("down");
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => { const y = window.scrollY; if (y !== last) { dir.current = y > last ? "down" : "up"; last = y; } };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!steps.length) return null;
  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="container-page py-16 md:py-20">
        <SectionHead d={d} tx={tx} />
        <ol className={cn("relative mt-12 grid gap-10 md:gap-6", steps.length === 2 ? "md:grid-cols-2" : steps.length >= 4 ? "md:grid-cols-4" : "md:grid-cols-3")}>
          <span aria-hidden="true" className="absolute left-0 right-0 top-7 hidden h-px bg-border md:block" />
          {steps.map((s, i) => <Step key={i} step={s} index={i} total={steps.length} dir={dir} />)}
        </ol>
      </div>
    </section>
  );
}

function Step({ step, index, total, dir }: { step: { title: string; body: string }; index: number; total: number; dir: React.RefObject<"down" | "up"> }) {
  const [vis, setVis] = useState(false);
  const [delay, setDelay] = useState(0);
  const ref = useCallback((node: HTMLLIElement | null) => {
    if (!node || typeof IntersectionObserver === "undefined") { setVis(true); return; }
    const io = new IntersectionObserver(([e]) => {
      const dd = dir.current ?? "down";
      setDelay((dd === "down" ? index : total - 1 - index) * 140);
      setVis(!!e?.isIntersecting);
    }, { threshold: 0.35, rootMargin: "0px 0px -8% 0px" });
    io.observe(node);
    return () => io.disconnect();
  }, [index, total, dir]);
  return (
    <li ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`db-step${vis ? " is-in" : ""} relative`}>
      <span className="relative z-10 flex size-14 items-center justify-center rounded-full bg-primary font-display text-xl font-extrabold text-primary-foreground shadow-sm ring-8 ring-[var(--background)]">{index + 1}</span>
      <h3 className="mt-5 text-xl font-semibold">{step.title}</h3>
      {step.body && <p className="mt-2 leading-relaxed text-muted-foreground">{step.body}</p>}
    </li>
  );
}

function CtaBlock({ d, tx }: P) {
  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-accent/20 blur-2xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-24 -left-10 size-72 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
      <div className="container-page relative py-16 text-center md:py-20">
        <h2 className="font-display text-3xl font-extrabold md:text-4xl">{tx("title")}</h2>
        {d.body && <p className="mx-auto mt-3 max-w-xl text-lg opacity-90">{tx("body")}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {d.primary_label && d.primary_href && <SmartLink href={d.primary_href} variant="accent" size="lg">{tx("primary_label")}<ArrowRight /></SmartLink>}
          {d.secondary_label && d.secondary_href && (
            <SmartLink href={d.secondary_href} size="lg" className="border border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">{tx("secondary_label")}</SmartLink>
          )}
        </div>
      </div>
    </section>
  );
}

function GalleryBlock({ d, tx }: P) {
  const imgs: { url: string; alt?: string }[] = (Array.isArray(d.images) ? d.images : []).filter((i: { url?: string }) => i?.url);
  return (
    <section className="container-page py-12 md:py-16">
      <SectionHead d={d} tx={tx} />
      {imgs.length === 0 ? <p className="mt-6 text-sm text-muted-foreground">No photos yet.</p> : (
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {imgs.map((im, i) => (
            <figure key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
              <img src={im.url} alt={im.alt ?? ""} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              {im.alt && <figcaption className="px-3 py-2 text-sm text-muted-foreground">{im.alt}</figcaption>}
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}

function VideoBlock({ d, tx }: P) {
  const id = youtubeId(String(d.url ?? ""));
  const [play, setPlay] = useState(false);
  return (
    <section className="container-page py-12 md:py-16">
      <SectionHead d={d} tx={tx} />
      <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-2xl border border-border bg-black">
        {!id ? <div className="grid aspect-video place-items-center bg-secondary text-sm text-muted-foreground">Add a YouTube link</div>
          : play ? (
            <iframe className="aspect-video w-full" src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`} title={d.title || "Video"} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
          ) : (
            <button type="button" onClick={() => setPlay(true)} className="group relative block aspect-video w-full" aria-label={`Play video: ${d.title || "video"}`}>
              <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover opacity-90" />
              <span className="absolute inset-0 grid place-items-center"><PlayCircle className="size-16 text-white drop-shadow-lg transition-transform group-hover:scale-110" /></span>
              <span className="absolute bottom-2 left-3 text-xs font-semibold text-white/90">Tap to play. Uses data.</span>
            </button>
          )}
      </div>
      {d.caption && <p className="mt-3 text-center text-sm text-muted-foreground">{d.caption}</p>}
    </section>
  );
}

/* ------------------------------------------------------- live sections */

function PathwaysBlock() {
  const pathways = usePathways();
  return <PathwaySelector items={pathways.data ?? []} />;
}

function StatsBlock() {
  const { t } = useI18n();
  const courses = usePublishedCourses();
  const reveal = useReveal<HTMLDListElement>();
  if (!courses.data?.length) return null;
  const totalLessons = courses.data.reduce((n, c) => n + (c.lessons?.length ?? 0), 0);
  const stats = [
    { icon: BookOpen, label: t("stats.courses", "Courses"), value: String(courses.data.length) },
    ...(totalLessons > 0 ? [{ icon: GraduationCap, label: t("stats.lessons", "Lessons"), value: String(totalLessons) }] : []),
    { icon: Globe, label: t("stats.languages", "Languages"), value: String(LANGS.length) },
    { icon: Gift, label: t("stats.cost", "Cost to learn"), value: t("stats.free", "Free") },
  ];
  return (
    <section aria-label="Platform at a glance" className="border-y border-border bg-primary text-primary-foreground">
      <dl ref={reveal} className="db-reveal container-page grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:gap-3 sm:text-left">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/10 text-accent"><s.icon className="size-5" aria-hidden="true" /></span>
            <span><dd className="font-display text-3xl font-extrabold text-accent">{s.value}</dd><dd className="text-sm opacity-90">{s.label}</dd></span>
          </div>
        ))}
      </dl>
    </section>
  );
}

function CoursesBlock({ d, tx }: P) {
  const { t } = useI18n();
  const courses = usePublishedCourses();
  const reveal = useReveal<HTMLDivElement>();
  const n = Math.min(Math.max(Number(d.count) || 4, 2), 12);
  return (
    <section className="container-page py-8">
      <div className="flex items-end justify-between gap-4">
        <SectionHead d={d} tx={tx} />
        <Link to="/courses" className="hidden shrink-0 font-semibold text-primary hover:underline sm:inline">{t("home.courses.all", "All courses")}</Link>
      </div>
      <div ref={reveal} className="db-reveal mt-8">
        {courses.isLoading ? <CardsSkeleton /> : courses.isError ? <ErrorNote /> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {mixPathways(courses.data ?? [], n).map((c, i) => <CourseCard key={c.id} course={c} index={i} />)}
          </div>
        )}
      </div>
    </section>
  );
}

function TestimonialsBlock() {
  const q = usePublished<{ id: string; quote: string; name: string; role_location: string }>("testimonials");
  return <Testimonials items={q.data ?? []} />;
}
function FaqsBlock() {
  const q = usePublished<{ id: string; question: string; answer: string }>("faqs");
  return <FaqSection items={q.data ?? []} />;
}
function PartnersBlock() {
  const q = usePublished<{ id: string; name: string; category: string }>("partners");
  return <Partners items={q.data ?? []} />;
}

function NewsBlock({ d, tx }: P) {
  const n = Math.min(Math.max(Number(d.count) || 3, 1), 6);
  const posts = usePosts({ limit: n });
  const list = posts.data?.posts ?? [];
  if (!posts.isLoading && list.length === 0) return null;
  return (
    <section className="container-page py-12 md:py-16">
      <div className="flex items-end justify-between gap-4">
        <SectionHead d={d} tx={tx} />
        <Link to="/news" className="hidden shrink-0 font-semibold text-primary hover:underline sm:inline">All news</Link>
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <Link key={p.id} to="/news/$slug" params={{ slug: p.slug }} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-colors hover:border-primary">
            {p.cover_url ? <img src={p.cover_url} alt={p.cover_alt} loading="lazy" className="aspect-[16/10] w-full object-cover" /> : <div className="grid aspect-[16/10] place-items-center bg-primary-soft"><Newspaper className="size-8 text-primary" /></div>}
            <div className="p-4"><p className="text-xs text-muted-foreground">{formatDate(p.published_at)}</p><p className="mt-1 font-semibold leading-snug">{p.title}</p></div>
          </Link>
        ))}
      </div>
    </section>
  );
}
