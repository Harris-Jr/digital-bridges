import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getToken } from "@/lib/api";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/_authenticated")({
  // Private learner/trainer area: keep it out of search indexes.
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  // Client-side guard: a token must be present. The API still enforces auth on
  // every protected request, so this is a UX gate, not the security boundary.
  beforeLoad: () => {
    if (!getToken()) throw redirect({ to: "/signin" });
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
