import { createFileRoute, redirect } from "@tanstack/react-router";

// The sign-in and sign-up screens are now one sliding page at /auth.
// /signin and /login open it in login mode.
export const Route = createFileRoute("/signin")({
  beforeLoad: () => {
    throw redirect({ to: "/auth" });
  },
});
