import { createFileRoute, redirect } from "@tanstack/react-router";

// /signup and /register open the combined /auth page in register mode.
export const Route = createFileRoute("/signup")({
  beforeLoad: () => {
    throw redirect({ to: "/auth", search: { mode: "register" } });
  },
});
