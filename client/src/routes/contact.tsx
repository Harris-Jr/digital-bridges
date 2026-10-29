import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, BookOpen, Users, Handshake, ChevronDown, ArrowRight } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SiteLayout } from "@/components/site";
import { apiPost } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Digital Bridges" },
      { name: "description", content: "Have a question about learning or running a community workshop? Send the Digital Bridges team a message." },
      { property: "og:title", content: "Contact — Digital Bridges" },
      { property: "og:description", content: "Let's talk. Send us a message." },
    ],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(2, "Please tell us your name").max(100),
  email: z.string().trim().email("This email does not look right").max(255),
  topic: z.string().min(1, "Please choose a topic"),
  message: z.string().trim().min(10, "Please write a little more so we can help").max(2000),
});

function Contact() {
  const { t } = useI18n();
  const [form, setForm] = useState({ name: "", email: "", topic: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const topics = [
    { value: "learning", label: t("contact.topic.learning", "Learning support") },
    { value: "workshops", label: t("contact.topic.workshops", "Community workshops") },
    { value: "partnerships", label: t("contact.topic.partnerships", "Partnerships") },
    { value: "general", label: t("contact.topic.general", "General enquiry") },
  ];

  const helps = [
    { icon: BookOpen, title: t("contact.topic.learning", "Learning support"), body: t("contact.help.learning", "Questions about courses or your account.") },
    { icon: Users, title: t("contact.topic.workshops", "Community workshops"), body: t("contact.help.workshops", "Help bringing digital skills to your community.") },
    { icon: Handshake, title: t("contact.topic.partnerships", "Partnerships"), body: t("contact.help.partnerships", "Explore ways to work with Digital Bridges.") },
  ];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return; // guard against duplicate submissions
    const r = schema.safeParse(form);
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      // Backend stores name/email/message only; carry the topic inside the message.
      const topicLabel = topics.find((x) => x.value === r.data.topic)?.label ?? r.data.topic;
      await apiPost("/contact", {
        name: r.data.name,
        email: r.data.email,
        message: `[${t("contact.topic.label", "Topic")}: ${topicLabel}]\n\n${r.data.message}`,
      }, false);
      setSent(true); // only after the backend confirms (apiPost throws on non-2xx)
    } catch {
      setErrors({ form: t("contact.error", "We could not send your message. Check your connection and try again.") });
    } finally {
      setBusy(false);
    }
  };

  const req = <span className="text-destructive" aria-hidden="true"> *</span>;
  const errText = "mt-1 text-sm text-destructive";

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="container-page pt-12 md:pt-16">
        <p className="eyebrow">{t("contact.eyebrow", "Contact us")}</p>
        <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] text-primary md:text-5xl">{t("contact.title", "Let's talk.")}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {t("contact.intro", "Have a question about learning or running a community workshop? We're here to help.")}
        </p>
      </section>

      {/* Two columns: help topics + form */}
      <section className="container-page grid gap-10 py-10 md:grid-cols-2 md:gap-14 md:py-14">
        {/* Left: how can we help */}
        <div>
          <h2 className="text-2xl text-primary md:text-3xl">{t("contact.help.title", "How can we help?")}</h2>
          <ul className="mt-8 space-y-6">
            {helps.map((h) => (
              <li key={h.title} className="flex gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                  <h.icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">{h.title}</h3>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{h.body}</p>
                </div>
              </li>
            ))}
          </ul>
          <hr className="mt-8 border-border" />
          <p className="mt-5 text-sm text-muted-foreground">{t("contact.help.note", "Choose a topic in the form and tell us a little more.")}</p>
        </div>

        {/* Right: form panel */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          {sent ? (
            <div role="status" aria-live="polite">
              <CheckCircle2 className="size-9 text-success" aria-hidden="true" />
              <h2 className="mt-3 text-xl text-primary">{t("contact.sent.title", "Thank you, your message is on its way.")}</h2>
              <p className="mt-1 text-muted-foreground">{t("contact.sent.body", "We will reply to")} {form.email}.</p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="space-y-5">
              <h2 className="text-xl font-bold text-primary">{t("contact.form.title", "Send us a message")}</h2>

              <div>
                <Label htmlFor="name">{t("contact.form.name", "Full name")}{req}</Label>
                <Input
                  id="name" name="name" type="text" autoComplete="name" required aria-required="true"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  aria-invalid={!!errors["name"]} aria-describedby={errors["name"] ? "name-err" : undefined}
                  placeholder={t("contact.form.namePh", "Your name")} className="mt-1 h-11"
                />
                {errors["name"] && <p id="name-err" className={errText}>{errors["name"]}</p>}
              </div>

              <div>
                <Label htmlFor="email">{t("contact.form.email", "Email address")}{req}</Label>
                <Input
                  id="email" name="email" type="email" autoComplete="email" inputMode="email" required aria-required="true"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  aria-invalid={!!errors["email"]} aria-describedby={errors["email"] ? "email-err" : undefined}
                  placeholder={t("contact.form.emailPh", "you@example.com")} className="mt-1 h-11"
                />
                {errors["email"] && <p id="email-err" className={errText}>{errors["email"]}</p>}
              </div>

              <div>
                <Label htmlFor="topic">{t("contact.form.topic", "Topic")}{req}</Label>
                <div className="relative mt-1">
                  <select
                    id="topic" name="topic" required aria-required="true"
                    value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    aria-invalid={!!errors["topic"]} aria-describedby={errors["topic"] ? "topic-err" : undefined}
                    className={cn(
                      "h-11 w-full appearance-none rounded-md border bg-background px-3 pr-10 text-sm outline-none transition-colors",
                      "focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary",
                      form.topic ? "text-foreground" : "text-muted-foreground",
                      errors["topic"] ? "border-destructive" : "border-input",
                    )}
                  >
                    <option value="" disabled>{t("contact.form.topicPh", "Select a topic")}</option>
                    {topics.map((o) => <option key={o.value} value={o.value} className="text-foreground">{o.label}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                </div>
                {errors["topic"] && <p id="topic-err" className={errText}>{errors["topic"]}</p>}
              </div>

              <div>
                <Label htmlFor="message">{t("contact.form.message", "Message")}{req}</Label>
                <Textarea
                  id="message" name="message" rows={5} required aria-required="true"
                  value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  aria-invalid={!!errors["message"]} aria-describedby={errors["message"] ? "message-err" : undefined}
                  placeholder={t("contact.form.messagePh", "How can we help?")} className="mt-1"
                />
                {errors["message"] && <p id="message-err" className={errText}>{errors["message"]}</p>}
              </div>

              {errors["form"] && <p role="alert" aria-live="assertive" className="text-sm text-destructive">{errors["form"]}</p>}

              <Button type="submit" disabled={busy} className="w-full">
                {busy ? t("contact.form.sending", "Sending…") : <>{t("contact.form.send", "Send message")}<ArrowRight /></>}
              </Button>
              <p className="text-center text-xs text-muted-foreground">{t("contact.form.privacy", "We'll use your email only to respond to your enquiry.")}</p>
            </form>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
