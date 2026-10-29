import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/policy-page";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Civic Wise" },
      { name: "description", content: "What data Civic Wise collects, why, and your rights under the Zambia Data Protection Act No. 3 of 2021." },
      { property: "og:title", content: "Privacy Policy — Civic Wise" },
      { property: "og:description", content: "How we collect, use and protect your personal information." },
    ],
  }),
  component: () => <PolicyPage slug="privacy" />,
});
