import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

/* Floating help assistant for signed-in learners. Hidden when AI is disabled. */
export function AssistantWidget() {
  const { user } = useAuth();
  const { lang, t } = useI18n();
  const cfg = useQuery({
    queryKey: ["assistant-config", user?.id],
    enabled: !!user,
    queryFn: () => apiGet<{ enabled: boolean }>("/assistant/config"),
    staleTime: 5 * 60_000,
  });

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  if (!user || !cfg.data?.enabled) return null;

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await apiPost<{ reply: string }>("/assistant/chat", { messages: next, lang });
      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: t("assistant.error", "Sorry, I could not answer just now. Please try again.") }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label={t("assistant.open", "Ask for help")}
          className="fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-200 hover:shadow-xl motion-safe:hover:scale-105"
        >
          <MessageCircle className="size-6" />
        </button>
      )}

      {open && (
        <div className="fixed inset-x-3 bottom-3 z-50 flex max-h-[80vh] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:inset-x-auto sm:right-5 sm:w-[380px]">
          <header className="flex items-center justify-between gap-2 bg-primary px-4 py-3 text-primary-foreground">
            <span className="inline-flex items-center gap-2 font-semibold"><Sparkles className="size-4 text-accent" />{t("assistant.title", "Help assistant")}</span>
            <button onClick={() => setOpen(false)} aria-label={t("assistant.close", "Close")} className="grid size-7 place-items-center rounded-full hover:bg-white/15"><X className="size-4" /></button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="rounded-xl bg-secondary/60 p-3 text-sm text-muted-foreground">
                {t("assistant.greeting", "Hi! Ask me anything about using your phone safely — mobile money, scams, WhatsApp, or which course to start with.")}
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={cn("max-w-[85%] rounded-2xl px-3 py-2 text-sm", m.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-secondary text-foreground")}>
                {m.content}
              </div>
            ))}
            {busy && <div className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-3 py-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />{t("assistant.thinking", "Thinking…")}</div>}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); void send(); }} className="flex items-center gap-2 border-t border-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("assistant.placeholder", "Type your question…")}
              className="h-11 flex-1 rounded-full border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none"
              aria-label={t("assistant.placeholder", "Type your question…")}
            />
            <Button type="submit" size="icon" className="shrink-0" disabled={busy || !input.trim()} aria-label={t("assistant.send", "Send")}>
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
