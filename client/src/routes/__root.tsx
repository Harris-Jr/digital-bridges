import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  type ErrorComponentProps,
} from "@tanstack/react-router";

import { AuthProvider } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n";
import { ConsentProvider } from "@/lib/consent";
import { CookieConsentManager, PolicyVersionGate, Analytics } from "@/components/compliance";
import { OfflineSync } from "@/components/offline-sync";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center bg-background px-4">
      <div className="container-page">
        <p className="eyebrow">Page not found</p>
        <h1 className="mt-2 text-4xl">We could not find that page.</h1>
        <p className="mt-2 text-muted-foreground">It may have moved. Try the courses list instead.</p>
        <div className="mt-6 flex gap-2">
          <Link to="/" className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 font-semibold text-primary-foreground">Go home</Link>
          <Link to="/courses" className="inline-flex min-h-11 items-center rounded-full border border-border px-5 font-semibold">See courses</Link>
        </div>
      </div>
    </div>
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
      { property: "og:image", content: "https://civicwise.online/images/logo.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://civicwise.online/images/logo.png" },
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
