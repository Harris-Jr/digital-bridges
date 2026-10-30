// Lightweight, dependency-free prerender for the static public routes.
//
// The app is a client-rendered SPA: Google executes the JS and sees the
// per-page <title>/description/OG that the router sets, and the site-wide
// Organization/WebSite JSON-LD already lives in the raw index.html. This step
// additionally writes a static HTML file per public route with that route's
// meta baked into the <head>, so crawlers that do NOT run JS (some AI answer
// engines, older scrapers, link unfurlers) still get correct per-page tags.
//
// It runs after `vite build` (as a postbuild step). nginx serves these files
// automatically with the standard SPA config `try_files $uri $uri/ /index.html`,
// and React hydrates on top as usual. Dynamic course pages stay SPA-rendered
// (still have JS-set meta + Course JSON-LD).
//
// Keep SITE_URL and the per-route title/description in sync with src/lib/seo.tsx
// and the matching route files. These are the only truly static public routes.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIST = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const SITE_URL = "https://civicwise.online";
const OG_IMAGE = `${SITE_URL}/images/og-image.png`;

const ROUTES = [
  { path: "/", title: "Civic Wise: Free digital and civic skills for Zambia", description: "Build confidence online and in your community. Free, simple lessons on using your phone safely, mobile money, finding work, your rights and taking part in your community. Works on any phone, even with little data." },
  { path: "/courses", title: "Free digital and civic courses | Civic Wise", description: "Browse free Civic Wise courses in simple language: phone basics, online safety, mobile money, spotting false news, finding work, your rights and taking part in your community. Works on any phone." },
  { path: "/about", title: "About Civic Wise: built with communities, for communities", description: "Civic Wise helps people across Zambia use phones and the internet with confidence. A free, offline-friendly platform by the Zambia Cyber Security Foundation, built with and for local communities." },
  { path: "/for-trainers", title: "For Trainers: run community digital skills sessions | Civic Wise", description: "Lead practical digital skills sessions with simple tools and ready-to-use teaching materials. Create learner groups, plan workshops and track progress. Free for community facilitators in Zambia." },
  { path: "/contact", title: "Contact Civic Wise", description: "Have a question about learning or running a community workshop? Send the Civic Wise team a message about learning support, community workshops or partnerships." },
  { path: "/privacy", title: "Privacy Policy | Civic Wise", description: "What data Civic Wise collects, why, and your rights under the Zambia Data Protection Act No. 3 of 2021." },
  { path: "/terms", title: "Terms of Use | Civic Wise", description: "Plain-language rules for using Civic Wise: acceptable use, open content licence and age policy." },
  { path: "/accessibility", title: "Accessibility Statement | Civic Wise", description: "Our commitment to WCAG 2.1 AA, how Civic Wise supports low-data and older devices, and how to tell us about a barrier." },
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function headFor(route) {
  const url = route.path === "/" ? `${SITE_URL}/` : SITE_URL + route.path;
  const t = esc(route.title);
  const d = esc(route.description);
  return [
    `<meta name="description" content="${d}" />`,
    `<meta name="robots" content="index, follow" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:title" content="${t}" />`,
    `<meta property="og:description" content="${d}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta name="twitter:title" content="${t}" />`,
    `<meta name="twitter:description" content="${d}" />`,
    `<meta name="twitter:image" content="${OG_IMAGE}" />`,
  ].join("\n    ");
}

const indexHtml = await readFile(join(DIST, "index.html"), "utf8");

for (const route of ROUTES) {
  // Replace the fallback <title> and insert the per-route meta before </head>.
  let html = indexHtml.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(route.title)}</title>`);
  html = html.replace("</head>", `    ${headFor(route)}\n  </head>`);
  if (route.path === "/") {
    await writeFile(join(DIST, "index.html"), html);
  } else {
    const dir = join(DIST, route.path.replace(/^\//, ""));
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "index.html"), html);
  }
  console.log(`prerendered ${route.path}`);
}
console.log(`prerender: ${ROUTES.length} routes written`);
