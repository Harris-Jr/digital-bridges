import express from "express";
import cors from "cors";
import helmet from "helmet";
import { corsOrigins, env } from "./env.js";
import { pool, query } from "./db.js";
import { errorMiddleware } from "./lib/http.js";
import { loadAuth } from "./middleware.js";
import { authRouter } from "./routes/auth.js";
import { contentRouter } from "./routes/content.js";
import { learnerRouter } from "./routes/learner.js";
import { profileRouter } from "./routes/profile.js";
import { trainerRouter } from "./routes/trainer.js";
import { publicRouter } from "./routes/public.js";
import { adminRouter } from "./routes/admin.js";
import { mediaRouter } from "./routes/media.js";
import { aiAdminRouter } from "./routes/ai-admin.js";
import { adminTranslationsRouter } from "./routes/admin-translations.js";
import { assistantRouter } from "./routes/assistant.js";

const app = express();

// Behind nginx on the VPS: trust the first proxy hop so req.ip reflects the
// real client address (X-Forwarded-For) for rate limiting.
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: corsOrigins.length === 1 && corsOrigins[0] === "*" ? true : corsOrigins,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(loadAuth);

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("select 1");
    res.json({ status: "ok" });
  } catch {
    res.status(503).json({ status: "db_unavailable" });
  }
});

// Dynamic sitemap including every published course. Served at the site root so
// it can be referenced directly in robots.txt. On the VPS, add an nginx location
// to proxy /sitemap.xml to this app; otherwise the static client/public/sitemap.xml
// (stable pages only) is served. Also available at /api/sitemap.xml.
const SITE_ORIGIN = (env.APP_URL || "https://civicwise.online").replace(/\/$/, "");
async function sitemapHandler(_req: express.Request, res: express.Response) {
  const staticPaths = ["/", "/courses", "/about", "/for-trainers", "/contact", "/privacy", "/terms", "/accessibility"];
  let courseSlugs: string[] = [];
  try {
    const { rows } = await query<{ slug: string }>("select slug from courses where is_published = true order by slug");
    courseSlugs = rows.map((r) => r.slug);
  } catch { /* fall back to static paths only */ }
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const urls = [
    ...staticPaths.map((p) => ({ loc: SITE_ORIGIN + (p === "/" ? "/" : p), priority: p === "/" ? "1.0" : "0.7" })),
    ...courseSlugs.map((s) => ({ loc: `${SITE_ORIGIN}/courses/${esc(s)}`, priority: "0.8" })),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${u.loc}</loc><priority>${u.priority}</priority></url>`)
    .join("\n")}\n</urlset>\n`;
  res.set("Content-Type", "application/xml").send(body);
}
app.get("/sitemap.xml", sitemapHandler);
app.get("/api/sitemap.xml", sitemapHandler);

app.use("/api/auth", authRouter);
app.use("/api", contentRouter);
app.use("/api", publicRouter);
app.use("/api/profile", profileRouter);
app.use("/api/me", learnerRouter);
app.use("/api/trainer", trainerRouter);
app.use("/api/admin/media", mediaRouter);
app.use("/api/admin/ai", aiAdminRouter);
app.use("/api/admin/translations", adminTranslationsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/assistant", assistantRouter);

app.use(errorMiddleware);

const server = app.listen(env.PORT, () => {
  console.log(`[server] Civic Wise API listening on :${env.PORT} (${env.NODE_ENV})`);
});

function shutdown(signal: string) {
  console.log(`[server] ${signal} received, shutting down`);
  server.close(() => {
    pool.end().finally(() => process.exit(0));
  });
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
