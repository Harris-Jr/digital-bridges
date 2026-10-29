import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/policy-page";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — Civic Wise" },
      { name: "description", content: "Plain-language rules for using Civic Wise: acceptable use, open content licence and age policy." },
      { property: "og:title", content: "Terms of Use — Civic Wise" },
      { property: "og:description", content: "The rules for using Civic Wise, in plain language." },
    ],
  }),
  component: () => <PolicyPage slug="terms" />,
});
