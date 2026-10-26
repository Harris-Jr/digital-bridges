// Centralised, validated environment configuration.
// In dev/prod the process is started with `node --env-file=.env`, so variables
// are already on process.env by the time this module loads.
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().default("30d"),
  // Comma-separated list of allowed browser origins for CORS.
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  // Cloudinary (optional). When unset, media uploads are disabled and the admin
  // falls back to pasting a URL.
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_FOLDER: z.string().default("digital-bridges"),
  // AI (optional). The learner assistant uses Gemini first and falls back to
  // Groq if Gemini is unset or fails. When BOTH key sets are unset, AI features
  // are disabled and the UI shows a plain help link instead.
  // GEMINI_MODEL defaults to the "latest Flash" alias so it tracks Google's
  // current model and does not break when a specific version is retired. Pin a
  // concrete version (e.g. gemini-3.8-flash) here or in .env if you prefer.
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-flash-latest"),
  // Groq fallback (optional, OpenAI-compatible). Default is a fast, low-cost
  // open model; override with any chat model your Groq account can access.
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().default("openai/gpt-oss-20b"),
  // SMTP email (optional). When SMTP_HOST/USER/PASS are unset, email is disabled
  // and the app runs normally (sends are skipped). Works with any provider
  // (Brevo, Gmail, Outlook, Hostinger, SendGrid, etc.) via these variables.
  // Port 465 → set SMTP_SECURE=true; port 587/25 → leave it false (STARTTLS).
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  // Parse explicitly: z.coerce.boolean() treats the string "false" as true.
  SMTP_SECURE: z.preprocess((v) => v === "true" || v === "1" || v === true, z.boolean()),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  // The From header, e.g. "Digital Bridges <no-reply@yourdomain.org>".
  // Falls back to SMTP_USER when unset.
  SMTP_FROM: z.string().optional(),
  // Public base URL of the app, used to build links inside emails.
  APP_URL: z.string().default("http://localhost:5173"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment configuration:");
  console.error(z.prettifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
export const corsOrigins = env.CORS_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean);
