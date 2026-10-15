import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getToken } from "@/lib/api";

export const Route = createFileRoute("/_authenticated")({
  // Client-side guard: a token must be present. The API still enforces auth on
  // every protected request, so this is a UX gate, not the security boundary.
  beforeLoad: () => {
    if (!getToken()) throw redirect({ to: "/signin" });
  },
  component: () => <Outlet />,
});
