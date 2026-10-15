import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

export type Lang = "en" | "bem" | "nya";
export const LANGS: { code: Lang; label: string; name: string }[] = [
  { code: "en", label: "EN", name: "English" },
  { code: "bem", label: "Bem", name: "Bemba" },
  { code: "nya", label: "Nya", name: "Nyanja" },
];

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (key: string, fallback: string) => string };
const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const saved = localStorage.getItem("db_lang") as Lang | null;
    if (saved && ["en", "bem", "nya"].includes(saved)) setLangState(saved);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang === "en" ? "en" : lang;
  }, [lang]);
  const { data } = useQuery({
    queryKey: ["i18n"],
    queryFn: () => apiGet<{ key: string; lang: string; value: string }[]>("/i18n", false),
    staleTime: 5 * 60_000,
  });
  const t = (key: string, fallback: string) =>
    data?.find((r) => r.key === key && r.lang === lang)?.value ??
    data?.find((r) => r.key === key && r.lang === "en")?.value ??
    fallback;
  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("db_lang", l);
  };
  return <I18nCtx.Provider value={{ lang, setLang, t }}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const c = useContext(I18nCtx);
  if (!c) throw new Error("useI18n outside provider");
  return c;
}
