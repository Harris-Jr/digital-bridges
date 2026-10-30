import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/policy-page";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () => seo({
    path: "/privacy",
    title: "Privacy Policy | Civic Wise",
    description: "What data Civic Wise collects, why, and your rights under the Zambia Data Protection Act No. 3 of 2021.",
  }),
  component: () => <PolicyPage slug="privacy" />,
});
