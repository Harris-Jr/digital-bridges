import { useState, type ReactNode, type InputHTMLAttributes } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { X, Eye, EyeOff, Lock, type LucideIcon } from "lucide-react";
import { LANGS, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/* Standalone auth screen: full-bleed illustration + glass card. No navbar/footer. */
export function AuthShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Mobile: fixed full-screen background (desktop uses the left panel below) */}
      <div className="fixed inset-0 lg:hidden">
        <img src="/images/auth-bg-mobile.jpg" alt="" loading="eager" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-transparent" />
      </div>

      {/* Desktop/tablet: left illustration panel with organic wave edge */}
      <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[42%] overflow-hidden lg:block lg:w-[58%]">
        <img
          src="/images/auth-bg-desktop.jpg"
          alt=""
          loading="eager"
          className="h-full w-full object-cover motion-safe:db-drift"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-[14%] px-10 text-white lg:px-14">
          <h1 className="font-display text-5xl font-extrabold tracking-tight [text-shadow:0_2px_12px_rgba(0,0,0,0.45)] lg:text-6xl">
            {t("auth.welcome", "Welcome")}
          </h1>
          <p className="mt-3 text-xl font-medium [text-shadow:0_2px_10px_rgba(0,0,0,0.5)]">
            {t("auth.tagline", "Building digital bridges")}
          </p>
        </div>
        {/* S-curve: the page background flows in from the right */}
        <svg className="absolute inset-y-0 right-0 h-full w-[120px] translate-x-[1px]" viewBox="0 0 120 1000" preserveAspectRatio="none" aria-hidden="true">
          <path d="M120,0 C 40,180 120,340 64,500 C 8,660 120,820 120,1000 L120,1000 Z" fill="var(--background)" />
        </svg>
      </div>

      {/* Language switcher */}
      <div className="absolute right-4 top-4 z-20">
        <LangPill />
      </div>

      {/* Mobile heading above the card */}
      <div className="absolute inset-x-0 top-20 z-10 px-6 text-center text-white lg:hidden">
        <h1 className="font-display text-4xl font-extrabold [text-shadow:0_2px_12px_rgba(0,0,0,0.5)]">{t("auth.welcome", "Welcome")}</h1>
        <p className="mt-1 font-medium [text-shadow:0_2px_10px_rgba(0,0,0,0.5)]">{t("auth.tagline", "Building digital bridges")}</p>
      </div>

      {/* Right content column with the glass card */}
      <div className="relative ml-auto flex min-h-screen w-full items-center justify-center px-5 py-10 lg:w-[42%] lg:bg-background">
        {/* soft blurred brand blobs for the glass to pick up */}
        <div className="pointer-events-none absolute left-1/2 top-1/3 -z-0 hidden size-72 -translate-x-1/2 rounded-full bg-primary/30 blur-3xl lg:block" aria-hidden="true" />
        <div className="pointer-events-none absolute bottom-1/4 right-6 -z-0 hidden size-56 rounded-full bg-accent/30 blur-3xl lg:block" aria-hidden="true" />

        <div className="glass-card glass-gloss relative w-full max-w-[380px] rounded-[20px] p-8">
          <Link
            to="/"
            aria-label="Close"
            className="absolute right-4 top-4 grid size-8 place-items-center rounded-full border border-foreground/20 text-foreground/70 transition-colors hover:border-foreground/40 hover:text-foreground"
          >
            <X className="size-4" />
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}

function LangPill() {
  const { lang, setLang } = useI18n();
  return (
    <div role="group" aria-label="Language" className="flex rounded-full border border-white/40 bg-white/30 p-1 backdrop-blur">
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLang(l.code)}
          aria-pressed={lang === l.code}
          className={cn(
            "min-h-8 rounded-full px-3 text-xs font-semibold transition-colors",
            lang === l.code ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:text-foreground",
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

/* Underline input: transparent, bottom border only, icon on the right. */
type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: LucideIcon;
  error?: string;
  rightSlot?: ReactNode;
};

export function UnderlineField({ label, icon: Icon, error, rightSlot, id, className, ...props }: FieldProps) {
  return (
    <div>
      <div className="group relative">
        <input
          id={id}
          placeholder={label}
          aria-label={label}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
          className={cn(
            "peer min-h-12 w-full border-b-2 border-foreground/25 bg-transparent pr-8 text-base text-foreground placeholder:text-muted-foreground transition-colors duration-[250ms] focus:border-primary focus:outline-none",
            className,
          )}
          {...props}
        />
        {rightSlot ?? (Icon && <Icon className="pointer-events-none absolute right-0 top-1/2 size-5 -translate-y-1/2 text-muted-foreground peer-focus:text-primary" aria-hidden="true" />)}
      </div>
      {error && <p id={`${id}-err`} className="mt-1 text-sm font-semibold text-destructive">{error}</p>}
    </div>
  );
}

export function PasswordField({ label, error, id, ...props }: Omit<FieldProps, "icon" | "rightSlot">) {
  const [show, setShow] = useState(false);
  return (
    <UnderlineField
      id={id}
      label={label}
      error={error}
      type={show ? "text" : "password"}
      rightSlot={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-0 top-1/2 grid size-6 -translate-y-1/2 place-items-center text-muted-foreground transition-colors hover:text-primary"
        >
          {show ? <EyeOff className="size-5" /> : props.value ? <Eye className="size-5" /> : <Lock className="size-5" />}
        </button>
      }
      {...props}
    />
  );
}

export { useNavigate as useAuthNavigate };
