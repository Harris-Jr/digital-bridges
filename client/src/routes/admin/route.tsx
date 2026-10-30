import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getToken } from "@/lib/api";
import { AdminShell } from "@/components/admin";

export const Route = createFileRoute("/admin")({
  // Admin CMS: never index.
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  // Token gate here; the AdminShell does the role (staff) check once roles load,
  // and every /api/admin call is enforced server-side regardless.
  beforeLoad: () => {
    if (!getToken()) throw redirect({ to: "/signin" });
  },
  component: () => (
    <AdminShell>
      <Outlet />
    </AdminShell>
  ),
});
