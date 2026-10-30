import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/policy-page";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/accessibility")({
  head: () => seo({
    path: "/accessibility",
    title: "Accessibility Statement | Civic Wise",
    description: "Our commitment to WCAG 2.1 AA, how Civic Wise supports low-data and older devices, and how to tell us about a barrier.",
  }),
  component: () => <PolicyPage slug="accessibility" />,
});
