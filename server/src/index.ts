import express from "express";
import cors from "cors";
import helmet from "helmet";
import { corsOrigins, env } from "./env.js";
import { pool } from "./db.js";
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

const app = express();

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

app.use("/api/auth", authRouter);
app.use("/api", contentRouter);
app.use("/api", publicRouter);
app.use("/api/profile", profileRouter);
app.use("/api/me", learnerRouter);
app.use("/api/trainer", trainerRouter);
app.use("/api/admin/media", mediaRouter);
app.use("/api/admin", adminRouter);

app.use(errorMiddleware);

const server = app.listen(env.PORT, () => {
  console.log(`[server] Digital Bridges API listening on :${env.PORT} (${env.NODE_ENV})`);
});

function shutdown(signal: string) {
  console.log(`[server] ${signal} received, shutting down`);
  server.close(() => {
    pool.end().finally(() => process.exit(0));
  });
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
