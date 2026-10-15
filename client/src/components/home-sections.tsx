import { useCallback, useRef, useState } from "react";
import { Quote, GraduationCap, Radio, HeartHandshake, Cpu, Landmark, Signal, type LucideIcon } from "lucide-react";

type Testimonial = { id: string; quote: string; name: string; role_location: string };
type Partner = { id: string; name: string; category: string };

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

export function Testimonials({ items }: { items: Testimonial[] }) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  if (items.length === 0) return null;

  return (
    <section className="border-y border-border bg-primary-soft/40">
      <div className="container-page py-16">
        <p className="eyebrow">From learners</p>
        <h2 className="mt-2 max-w-xl text-3xl md:text-4xl">Small wins people felt in their own words</h2>

        <div ref={ref} className="mt-10 grid gap-5 md:grid-cols-3">
          {items.slice(0, 3).map((q, i) => (
            <figure
              key={q.id}
              style={{ ["--db-reveal-delay" as string]: `${i * 120}ms` }}
              className={`db-reveal${shown ? " is-in" : ""} group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow duration-300 hover:shadow-md`}
            >
              <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-success" aria-hidden="true" />
              <Quote className="size-8 shrink-0 text-accent/80" aria-hidden="true" />
              <blockquote className="mt-4 flex-1 text-lg leading-relaxed text-foreground">{q.quote}</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-border/70 pt-4">
                <span className={`grid size-10 shrink-0 place-items-center rounded-full font-display text-sm font-extrabold ${AVATAR_TONES[i % AVATAR_TONES.length]}`} aria-hidden="true">
                  {initials(q.name)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{q.name}</span>
                  <span className="block truncate text-sm text-muted-foreground">{q.role_location}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
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

function PartnerChip({ partner }: { partner: Partner }) {
  const Icon = PARTNER_ICON[partner.category] ?? HeartHandshake;
  return (
    <span className="mx-2 inline-flex items-center gap-2.5 whitespace-nowrap rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold shadow-sm">
      <Icon className="size-4 text-primary" aria-hidden="true" />
      {partner.name}
    </span>
  );
}

export function PartnersMarquee({ items }: { items: Partner[] }) {
  if (items.length === 0) return null;
  // Duplicate the list so the -50% translate loops seamlessly.
  const track = [...items, ...items];

  return (
    <section className="container-page py-16">
      <p className="eyebrow">Working with</p>
      <h2 className="mt-2 text-3xl">Built alongside local institutions</h2>
      <p className="mt-2 max-w-lg text-muted-foreground">
        Schools, radio stations, ICT hubs and community groups helping learners meet us where they already are.
      </p>

      <div className="db-marquee-group db-marquee-mask mt-8 overflow-hidden" aria-label="Partner organisations">
        <ul className="db-marquee-track py-1" style={{ ["--db-marquee-duration" as string]: `${Math.max(24, items.length * 6)}s` }}>
          {track.map((p, i) => (
            <li key={`${p.id}-${i}`} aria-hidden={i >= items.length}>
              <PartnerChip partner={p} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
