import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/policy-page";

export const Route = createFileRoute("/accessibility")({
  head: () => ({
    meta: [
      { title: "Accessibility Statement — Civic Wise" },
      { name: "description", content: "Our commitment to WCAG 2.1 AA and how to tell us about a barrier." },
      { property: "og:title", content: "Accessibility Statement — Civic Wise" },
      { property: "og:description", content: "We want everyone to be able to learn on Civic Wise." },
    ],
  }),
  component: () => <PolicyPage slug="accessibility" />,
});
