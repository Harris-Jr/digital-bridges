import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SiteLayout, PageHero } from "@/components/site";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Digital Bridges" },
      { name: "description", content: "Send the Digital Bridges team a message, ask about workshops, or make a data request." },
      { property: "og:title", content: "Contact — Digital Bridges" },
      { property: "og:description", content: "Send us a message. We reply within a few working days." },
    ],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(2, "Please tell us your name").max(100),
  email: z.string().trim().email("This email does not look right").max(255),
  message: z.string().trim().min(10, "Please write a little more so we can help").max(2000),
});

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    setBusy(true);
    const { error } = await supabase.from("contact_messages").insert(r.data);
    setBusy(false);
    if (error) setErrors({ form: "We could not send your message. Check your connection and try again." });
    else setSent(true);
  };
  return (
    <SiteLayout>
      <PageHero eyebrow="Contact" title="Talk to us" sub="Questions about lessons, workshops, or your data? Send a message and we will reply within a few working days." />
      <section className="container-page max-w-xl">
        {sent ? (
          <div role="status" className="rounded-2xl border border-border bg-card p-6">
            <CheckCircle2 className="size-8 text-success" aria-hidden="true" />
            <h2 className="mt-3 text-xl">Thank you, your message is on its way.</h2>
            <p className="mt-1 text-muted-foreground">We will reply to {form.email}.</p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
            {(["name", "email"] as const).map((k) => (
              <div key={k}>
                <Label htmlFor={k}>{k === "name" ? "Your name" : "Your email"}</Label>
                <Input id={k} type={k === "email" ? "email" : "text"} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} aria-invalid={!!errors[k]} aria-describedby={`${k}-err`} className="mt-1 h-11" />
                {errors[k] && <p id={`${k}-err`} className="mt-1 text-sm text-destructive">{errors[k]}</p>}
              </div>
            ))}
            <div>
              <Label htmlFor="message">Your message</Label>
              <Textarea id="message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} aria-invalid={!!errors["message"]} aria-describedby="message-err" className="mt-1" />
              {errors["message"] && <p id="message-err" className="mt-1 text-sm text-destructive">{errors["message"]}</p>}
            </div>
            {errors["form"] && <p role="alert" className="text-sm text-destructive">{errors["form"]}</p>}
            <Button type="submit" disabled={busy}>{busy ? "Sending…" : "Send message"}</Button>
          </form>
        )}
      </section>
    </SiteLayout>
  );
}
