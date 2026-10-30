import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/policy-page";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () => seo({
    path: "/terms",
    title: "Terms of Use | Civic Wise",
    description: "Plain-language rules for using Civic Wise: acceptable use, open content licence and age policy.",
  }),
  component: () => <PolicyPage slug="terms" />,
});
