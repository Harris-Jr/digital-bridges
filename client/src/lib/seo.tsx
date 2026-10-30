import { useEffect } from "react";

// Production origin for canonical and social URLs. The client build is static,
// so this is fixed to the live domain.
export const SITE_URL = "https://civicwise.online";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-image.png`;

type SeoInput = {
  path: string; // absolute path, e.g. "/about" or "/courses/phone-basics"
  title: string;
  description: string;
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
};

/** Build the `head` payload (meta + canonical link) for a route. Keeps title,
    description, canonical and Open Graph / Twitter tags consistent everywhere. */
export function seo({ path, title, description, image = DEFAULT_OG_IMAGE, type = "website", noindex }: SeoInput) {
  const url = path === "/" ? `${SITE_URL}/` : SITE_URL + path;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: noindex ? "noindex, nofollow" : "index, follow" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { property: "og:type", content: type },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url || SITE_URL }],
  };
}

/** Inject a JSON-LD structured-data block into <head>. Rendered client-side;
    search engines that execute JS pick it up. Safe to use several per page. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const json = JSON.stringify(data);
  useEffect(() => {
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.text = json;
    document.head.appendChild(el);
    return () => { if (el.parentNode) el.parentNode.removeChild(el); };
  }, [json]);
  return null;
}

/** Canonical absolute URL for a path (for use inside JSON-LD). */
export function canonical(path: string): string {
  return SITE_URL + (path === "/" ? "" : path);
}
