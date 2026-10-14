import { Smartphone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
