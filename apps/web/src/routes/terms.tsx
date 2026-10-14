import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/policy-page";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — Digital Bridges" },
      { name: "description", content: "Plain-language rules for using Digital Bridges: acceptable use, open content licence and age policy." },
      { property: "og:title", content: "Terms of Use — Digital Bridges" },
      { property: "og:description", content: "The rules for using Digital Bridges, in plain language." },
    ],
  }),
  component: () => <PolicyPage slug="terms" />,
});
