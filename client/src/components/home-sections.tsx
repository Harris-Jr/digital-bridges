import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Quote, GraduationCap, Radio, HeartHandshake, Cpu, Landmark, Signal, ArrowRight, ChevronLeft, ChevronRight, ChevronDown, type LucideIcon } from "lucide-react";
import { Icon } from "@/components/site";
import { useI18n } from "@/lib/i18n";
import type { Pathway } from "@/lib/content";
import { cn } from "@/lib/utils";
import { JsonLd } from "@/lib/seo";

type Testimonial = { id: string; quote: string; name: string; role_location: string };
type Partner = { id: string; name: string; category: string };

/* Home "choose your path" selector, one card per pathway (e.g. Digital Skills,
   Civic Education). Each card opens that pathway's courses. */
export function PathwaySelector({ items }: { items: Pathway[] }) {
  const { t } = useI18n();
  if (items.length === 0) return null;
  return (
    <section className="container-page py-16 md:py-20">
      <div className="max-w-2xl">
        <p className="eyebrow">{t("home.path.eyebrow", "Choose your path")}</p>
        <h2 className="mt-2 text-3xl md:text-4xl">{t("home.path.title", "What would you like to learn?")}</h2>
        <p className="mt-3 text-lg text-muted-foreground">{t("home.path.sub", "Pick a path to see its courses. You can switch between paths any time.")}</p>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {items.map((p) => {
          const accent = p.accent === "accent";
          return (
            <Link
              key={p.id}
              to="/paths/$slug"
              params={{ slug: p.slug }}
              className="group relative flex items-start gap-5 overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-sm transition-[transform,box-shadow,border-color] duration-300 ease-out hover:border-primary/40 hover:shadow-lg motion-safe:hover:-translate-y-1"
            >
              <span className={cn("grid size-16 shrink-0 place-items-center rounded-2xl transition-colors duration-300", accent ? "bg-accent-soft text-accent-foreground group-hover:bg-accent" : "bg-primary-soft text-primary group-hover:bg-primary group-hover:text-primary-foreground")}>
                <Icon name={p.icon_name} className="size-8" />
              </span>
              <div className="min-w-0">
                <h3 className="text-2xl font-semibold">{p.title}</h3>
                <p className="mt-1 text-muted-foreground">{p.subtitle}</p>
                <p className="mt-4 inline-flex items-center gap-1.5 font-semibold text-primary">
                  {p.course_count ?? 0} {p.course_count === 1 ? t("home.path.course", "course") : t("home.path.courses", "courses")}
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/* Reveal a section's children once, when it first scrolls into view.
   Uses a callback ref so the observer attaches whenever the node mounts
   (e.g. after data loads), and reveals immediately where IntersectionObserver
   is unavailable, so content is never left hidden. */
function useReveal<T extends HTMLElement>() {
  const [shown, setShown] = useState(false);
  const io = useRef<IntersectionObserver | null>(null);
  const ref = useCallback(
    (node: T | null) => {
      io.current?.disconnect();
      if (!node || shown) return;
      if (typeof IntersectionObserver === "undefined") {
        setShown(true);
        return;
      }
      io.current = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            setShown(true);
            io.current?.disconnect();
          }
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.15 },
      );
      io.current.observe(node);
    },
    [shown],
  );
  return { ref, shown };
}

const AVATAR_TONES = [
  "bg-primary text-primary-foreground",
  "bg-accent text-accent-foreground",
  "bg-success text-white",
];

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* Testimonials carousel: switches through the real learner quotes in the
   database, one at a time, auto-advancing and pausing on hover. No invented
   quotes, add more in admin and they join the rotation. */
export function Testimonials({ items }: { items: Testimonial[] }) {
  const { t } = useI18n();
  const { ref, shown } = useReveal<HTMLDivElement>();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = items.length;

  useEffect(() => { if (i >= n && n > 0) setI(0); }, [n, i]);
  useEffect(() => {
    if (n <= 1 || paused) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setI((p) => (p + 1) % n), 6000);
    return () => clearInterval(id);
  }, [n, paused]);

  if (n === 0) return null;
  const q = items[i] ?? items[0]!;
  const go = (d: number) => setI((p) => (p + d + n) % n);

  return (
    <section className="border-y border-border bg-primary-soft/40">
      <div className="container-page py-16">
        <p className="eyebrow">{t("home.testimonials.eyebrow", "From learners")}</p>
        <h2 className="mt-2 max-w-xl text-3xl md:text-4xl">{t("home.testimonials.title", "Small wins people felt, in their own words")}</h2>

        <div
          ref={ref}
          className={`db-reveal${shown ? " is-in" : ""} mt-10`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <figure key={q.id} className="db-fade relative mx-auto flex max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-sm">
            <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-success" aria-hidden="true" />
            <Quote className="size-9 shrink-0 text-accent/80" aria-hidden="true" />
            <blockquote className="mt-4 text-xl leading-relaxed text-foreground">{q.quote}</blockquote>
            <figcaption className="mt-6 flex items-center gap-3 border-t border-border/70 pt-4">
              <span className={`grid size-11 shrink-0 place-items-center rounded-full font-display text-sm font-extrabold ${AVATAR_TONES[i % AVATAR_TONES.length]}`} aria-hidden="true">
                {initials(q.name)}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-semibold">{q.name}</span>
                <span className="block truncate text-sm text-muted-foreground">{q.role_location}</span>
              </span>
            </figcaption>
          </figure>

          {n > 1 && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <button type="button" onClick={() => go(-1)} aria-label={t("testimonials.prev", "Previous")} className="grid size-10 place-items-center rounded-full border border-border bg-card text-foreground/70 transition-colors hover:border-primary hover:text-primary">
                <ChevronLeft className="size-5" aria-hidden="true" />
              </button>
              <div className="flex gap-2" role="tablist" aria-label={t("testimonials.choose", "Choose a testimonial")}>
                {items.map((it, idx) => (
                  <button
                    key={it.id}
                    type="button"
                    role="tab"
                    aria-selected={idx === i}
                    aria-label={`${idx + 1}`}
                    onClick={() => setI(idx)}
                    className={cn("h-2.5 rounded-full transition-all duration-300", idx === i ? "w-6 bg-primary" : "w-2.5 bg-border hover:bg-primary/40")}
                  />
                ))}
              </div>
              <button type="button" onClick={() => go(1)} aria-label={t("testimonials.next", "Next")} className="grid size-10 place-items-center rounded-full border border-border bg-card text-foreground/70 transition-colors hover:border-primary hover:text-primary">
                <ChevronRight className="size-5" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

type Faq = { id: string; question: string; answer: string };

/* FAQ section: real, admin-managed questions rendered as semantic details/summary
   plus FAQPage structured data so answer engines can extract them. Hidden when
   there are no FAQs. */
export function FaqSection({ items }: { items: Faq[] }) {
  const { t } = useI18n();
  if (items.length === 0) return null;
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
  return (
    <section className="container-page py-16" aria-labelledby="faq-heading">
      <JsonLd data={ld} />
      <div className="max-w-2xl">
        <p className="eyebrow">{t("home.faq.eyebrow", "Questions")}</p>
        <h2 id="faq-heading" className="mt-2 text-3xl md:text-4xl">{t("home.faq.title", "Frequently asked questions")}</h2>
      </div>
      <div className="mt-8 max-w-3xl divide-y divide-border border-y border-border">
        {items.map((f) => (
          <details key={f.id} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-foreground [&::-webkit-details-marker]:hidden">
              {f.question}
              <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
            </summary>
            <p className="mt-3 leading-relaxed text-muted-foreground">{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

const PARTNER_ICON: Record<string, LucideIcon> = {
  school: GraduationCap,
  radio: Radio,
  cs: HeartHandshake,
  ict_hub: Cpu,
  gov: Landmark,
  telecom: Signal,
};

const PARTNER_LABEL: Record<string, string> = {
  school: "School",
  radio: "Community radio",
  cs: "Civil society",
  ict_hub: "ICT hub",
  gov: "Government",
  telecom: "Telecom",
};

function PartnerCard({ partner }: { partner: Partner }) {
  const Icon = PARTNER_ICON[partner.category] ?? HeartHandshake;
  return (
    <div className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-[transform,box-shadow,border-color] duration-300 ease-out hover:border-primary/40 hover:shadow-md motion-safe:hover:-translate-y-1">
      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h3 className="font-semibold leading-snug">{partner.name}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{PARTNER_LABEL[partner.category] ?? "Partner"}</p>
      </div>
    </div>
  );
}

export function Partners({ items }: { items: Partner[] }) {
  const { t } = useI18n();
  if (items.length === 0) return null;
  return (
    <section className="container-page py-16">
      <div className="max-w-2xl">
        <p className="eyebrow">{t("home.partners.eyebrow", "Working with")}</p>
        <h2 className="mt-2 text-3xl md:text-4xl">{t("home.partners.title", "Built alongside local institutions")}</h2>
        <p className="mt-3 text-lg text-muted-foreground">
          Schools, radio stations, ICT hubs and community groups helping learners meet us where they already are.
        </p>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => <PartnerCard key={p.id} partner={p} />)}
      </div>
    </section>
  );
}
