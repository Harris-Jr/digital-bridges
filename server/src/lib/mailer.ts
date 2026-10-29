// SMTP email. Provider-agnostic: configured entirely through environment
// variables, so Brevo, Gmail, Outlook, Hostinger or SendGrid all work. When
// SMTP is not configured the app runs normally and sends are skipped (logged).
import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../env.js";

export function mailEnabled(): boolean {
  return !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
}

let transporter: Transporter | null = null;
function getTransport(): Transporter | null {
  if (!mailEnabled()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE, // true for 465, false for 587/25 (STARTTLS)
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }
  return transporter;
}

function fromAddress(): string {
  return env.SMTP_FROM || env.SMTP_USER || "no-reply@digital-bridges";
}

/**
 * Send an email. Resolves true on success, false when email is disabled or the
 * send fails, never throws, so callers (e.g. signup) are never blocked or
 * broken by email problems. Fire-and-forget is safe.
 */
export async function sendMail(opts: { to: string; subject: string; html: string; text?: string }): Promise<boolean> {
  const tx = getTransport();
  if (!tx) {
    console.info(`[mail] skipped (SMTP not configured): "${opts.subject}" -> ${opts.to}`);
    return false;
  }
  try {
    await tx.sendMail({
      from: fromAddress(),
      to: opts.to,
      subject: opts.subject,
      text: opts.text ?? stripHtml(opts.html),
      html: opts.html,
    });
    return true;
  } catch (err) {
    console.error(`[mail] failed to send "${opts.subject}" to ${opts.to}:`, err instanceof Error ? err.message : err);
    return false;
  }
}

function stripHtml(html: string): string {
  return html.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/* ------------------------------------------------------------- templates */

const BRAND = "#14532D";
const ACCENT = "#C9900B";

/** Shared branded wrapper for every transactional email. */
function layout(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;background:#faf7f0;font-family:Arial,Helvetica,sans-serif;color:#1c1917;">
  <div style="max-width:560px;margin:0 auto;padding:24px;">
    <div style="padding:8px 0 16px;border-bottom:3px solid ${BRAND};">
      <span style="color:${BRAND};font-weight:800;font-size:18px;letter-spacing:.02em;">Civic Wise</span>
    </div>
    <div style="background:#ffffff;border:1px solid #e7e2d6;border-radius:14px;padding:28px;margin-top:20px;">
      <h1 style="margin:0 0 14px;font-size:22px;color:${BRAND};">${title}</h1>
      ${bodyHtml}
    </div>
    <p style="color:#78716c;font-size:12px;margin-top:20px;line-height:1.6;">
      Civic Wise, free digital and civic skills for communities in Zambia.<br/>
      A Zambia Cyber Security Foundation initiative.
    </p>
  </div></body></html>`;
}

function button(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:${ACCENT};color:#1c1917;font-weight:700;text-decoration:none;padding:12px 22px;border-radius:999px;margin-top:8px;">${label}</a>`;
}

/** Welcome email sent after a learner signs up. */
export function welcomeEmail(name: string): { subject: string; html: string } {
  const first = (name || "").trim().split(" ")[0] || "there";
  const url = env.APP_URL.replace(/\/$/, "");
  return {
    subject: "Welcome to Civic Wise",
    html: layout("Welcome, " + escapeHtml(first) + "!", `
      <p style="line-height:1.7;margin:0 0 14px;">Your free account is ready. Civic Wise has short, simple lessons on using your phone safely, mobile money, finding work, and taking part in your community, in English, Bemba and Nyanja.</p>
      <p style="line-height:1.7;margin:0 0 18px;">Pick a course and start whenever you like. You can even download courses to use offline.</p>
      ${button("Start learning", url + "/dashboard")}
    `),
  };
}

/** Password reset email with a time-limited link. */
export function passwordResetEmail(resetUrl: string): { subject: string; html: string } {
  return {
    subject: "Reset your Civic Wise password",
    html: layout("Reset your password", `
      <p style="line-height:1.7;margin:0 0 14px;">We received a request to reset the password for your Civic Wise account. Click below to choose a new one. This link expires in one hour.</p>
      ${button("Reset my password", resetUrl)}
      <p style="line-height:1.7;margin:18px 0 0;color:#78716c;font-size:13px;">If you did not ask for this, you can safely ignore this email, your password will not change.</p>
    `),
  };
}

/** Email to a facilitator when their workshop request is approved or declined. */
export function workshopDecisionEmail(topic: string, approved: boolean): { subject: string; html: string } {
  const url = env.APP_URL.replace(/\/$/, "");
  const verdict = approved ? "approved" : "not approved this time";
  return {
    subject: `Your workshop request was ${approved ? "approved" : "reviewed"}`,
    html: layout(`Workshop ${approved ? "approved" : "update"}`, `
      <p style="line-height:1.7;margin:0 0 14px;">Your workshop request <strong>"${escapeHtml(topic)}"</strong> has been <strong>${verdict}</strong>.</p>
      <p style="line-height:1.7;margin:0 0 18px;">${approved ? "You can see it and manage your cohorts in the trainer area." : "You can adjust the details and submit a new request any time."}</p>
      ${button("Open the trainer area", url + "/trainer")}
    `),
  };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}
