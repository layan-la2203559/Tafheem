import { Resend } from "resend";

/**
 * Transactional email helper (Resend). Server-only — never import into a client
 * component. The API key comes from the environment, NEVER hardcoded.
 *
 * NOTE: this is for emails the APP sends itself (welcome, notifications, etc.).
 * Auth emails (verify/reset) are sent by Supabase — to route those through
 * Resend, set Resend as the custom SMTP provider in the Supabase dashboard.
 */
export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from }: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }
  const resend = new Resend(apiKey);
  const sender = from || process.env.RESEND_FROM || "onboarding@resend.dev";

  const { data, error } = await resend.emails.send({
    from: sender,
    to,
    subject,
    html,
  });
  if (error) {
    // Don't leak provider internals to callers; log server-side.
    console.error("[tafheem] Resend send failed:", error);
    throw new Error("Failed to send email");
  }
  return data;
}
