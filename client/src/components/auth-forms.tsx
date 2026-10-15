import { Smartphone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Social sign-in is not wired up in this build. The control is kept disabled so
// the layout is stable and the option can be enabled later without a redesign.
export function GoogleButton({ label }: { label: string }) {
  return (
    <div>
      <Button type="button" variant="outline" className="w-full" disabled aria-disabled="true">
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true"><path fill="currentColor" d="M21.35 11.1H12v2.9h5.35c-.25 1.5-1.7 4.4-5.35 4.4-3.2 0-5.85-2.65-5.85-5.9S8.8 6.6 12 6.6c1.85 0 3.05.8 3.75 1.45l2.55-2.45C16.7 4.1 14.55 3 12 3 6.95 3 2.9 7.05 2.9 12S6.95 21 12 21c5.2 0 8.65-3.65 8.65-8.8 0-.6-.05-1.05-.15-1.5z" /></svg>
        {label}
      </Button>
      <p className="mt-2 text-xs text-muted-foreground">Google sign-in is coming soon. Please use your email for now.</p>
    </div>
  );
}

export function MethodTabs({ method, setMethod }: { method: "phone" | "email"; setMethod: (m: "phone" | "email") => void }) {
  return (
    <div role="tablist" aria-label="Sign-in method" className="grid grid-cols-2 rounded-full border border-border bg-background p-1">
      {(["phone", "email"] as const).map((m) => (
        <button key={m} role="tab" aria-selected={method === m} type="button" onClick={() => setMethod(m)}
          className={cn("inline-flex min-h-10 items-center justify-center gap-2 rounded-full text-sm font-semibold", method === m ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
          {m === "phone" ? <Smartphone className="size-4" aria-hidden="true" /> : <Mail className="size-4" aria-hidden="true" />}
          {m === "phone" ? "Phone" : "Email"}
        </button>
      ))}
    </div>
  );
}

export function PhoneSoon({ onEmail }: { onEmail: () => void }) {
  return (
    <div className="rounded-xl bg-accent-soft p-4 text-sm">
      <p className="font-semibold">Sign in with a phone code is coming soon.</p>
      <p className="mt-1">We are still setting up SMS codes with the networks. For now, please use your email address. It only takes a minute.</p>
      <Button type="button" className="mt-3" onClick={onEmail}>Use email instead</Button>
    </div>
  );
}
