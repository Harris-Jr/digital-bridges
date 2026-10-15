import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/policy-page";

export const Route = createFileRoute("/accessibility")({
  head: () => ({
    meta: [
      { title: "Accessibility Statement — Digital Bridges" },
      { name: "description", content: "Our commitment to WCAG 2.1 AA and how to tell us about a barrier." },
      { property: "og:title", content: "Accessibility Statement — Digital Bridges" },
      { property: "og:description", content: "We want everyone to be able to learn on Digital Bridges." },
    ],
  }),
  component: () => <PolicyPage slug="accessibility" />,
});
