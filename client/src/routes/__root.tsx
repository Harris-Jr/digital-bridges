import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  type ErrorComponentProps,
} from "@tanstack/react-router";

import { SiteLayout } from "@/components/site";
import { AuthProvider } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n";
import { ConsentProvider } from "@/lib/consent";
import { CookieConsentManager, PolicyVersionGate, Analytics } from "@/components/compliance";
import { OfflineSync } from "@/components/offline-sync";
import { Toaster } from "@/components/ui/sonner";

/** On-brand "lost" illustration: a tipped-open box with an x_x face. */
function Lost404() {
  return (
    <svg viewBox="0 0 260 230" className="h-48 w-48 md:h-60 md:w-60" role="img" aria-label="Page not found">
      <ellipse cx="130" cy="206" rx="80" ry="11" className="fill-primary" opacity="0.1" />
      {/* motion dashes */}
      <g className="stroke-accent" strokeWidth="5" strokeLinecap="round" opacity="0.85">
        <path d="M40 74 h26" /><path d="M28 100 h20" /><path d="M44 126 h22" />
        <path d="M220 74 h-26" /><path d="M232 100 h-20" /><path d="M216 126 h-22" />
      </g>
      {/* box body */}
      <rect x="80" y="82" width="100" height="112" rx="10" className="fill-background stroke-primary" strokeWidth="6" />
      {/* open lid flaps */}
      <path d="M80 82 L58 58 L96 58 L108 82 Z" className="fill-primary-soft stroke-primary" strokeWidth="6" strokeLinejoin="round" />
      <path d="M180 82 L202 58 L164 58 L152 82 Z" className="fill-primary-soft stroke-primary" strokeWidth="6" strokeLinejoin="round" />
      {/* face */}
      <g className="stroke-primary" strokeWidth="6" strokeLinecap="round" fill="none">
        <path d="M104 120 l16 16 M120 120 l-16 16" />
        <path d="M140 120 l16 16 M156 120 l-16 16" />
        <path d="M110 168 q20 -18 40 0" />
      </g>
    </svg>
  );
}

function NotFoundComponent() {
  // 404s should not be indexed.
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const created = !meta;
    const prev = meta?.getAttribute("content") ?? null;
    if (!meta) { meta = document.createElement("meta"); meta.setAttribute("name", "robots"); document.head.appendChild(meta); }
    meta.setAttribute("content", "noindex, follow");
    return () => {
      if (created) meta?.parentNode?.removeChild(meta);
      else if (prev) meta?.setAttribute("content", prev);
    };
  }, []);
  return (
    <SiteLayout>
      <section className="container-page flex min-h-[70vh] flex-col items-center justify-center gap-10 py-16 text-center md:flex-row md:gap-14 md:text-left">
        <Lost404 />
        <div className="max-w-md">
          <p className="font-display text-6xl font-extrabold leading-none text-primary md:text-7xl">404</p>
          <h1 className="mt-3 text-2xl font-bold md:text-3xl">Something's missing.</h1>
          <p className="mt-3 text-muted-foreground">This page may have moved, or the link was not quite right. Let's get you back on track.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3 md:justify-start">
            <Link to="/" className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 font-semibold text-primary-foreground transition-colors hover:bg-primary/90">Go to homepage</Link>
            <Link to="/courses" className="inline-flex min-h-11 items-center rounded-full border border-border px-6 font-semibold transition-colors hover:border-primary hover:text-primary">Browse courses</Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center bg-background px-4">
      <div className="container-page">
        <h1 className="text-2xl">This page did not load</h1>
        <p className="mt-2 text-muted-foreground">Something went wrong. Check your connection and try again.</p>
        <div className="mt-6 flex gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 font-semibold text-primary-foreground"
          >
            Try again
          </button>
          <a href="/" className="inline-flex min-h-11 items-center rounded-full border border-border px-5 font-semibold">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { title: "Civic Wise: Free digital and civic skills for Zambia" },
      { name: "description", content: "Free, simple lessons on phones, mobile money, online safety, finding work, your rights and taking part in your community, for communities across Zambia." },
      { name: "robots", content: "index, follow" },
      { property: "og:site_name", content: "Civic Wise" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Civic Wise: Free digital and civic skills for Zambia" },
      { property: "og:description", content: "Free, simple lessons for communities across Zambia, on any phone, even with little data." },
      { property: "og:image", content: "https://civicwise.online/images/og-image.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://civicwise.online/images/og-image.png" },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <I18nProvider>
          <ConsentProvider>
            <HeadContent />
            <Outlet />
            <CookieConsentManager />
            <PolicyVersionGate />
            <OfflineSync />
            <Analytics />
            <Toaster />
          </ConsentProvider>
        </I18nProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
