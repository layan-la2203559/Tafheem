/**
 * Send a test email via Resend to confirm the setup works.
 *
 *   npm run email:test                       # sends to your Resend account email
 *   npm run email:test you@example.com       # sends to a specific address
 *
 * With from=onboarding@resend.dev you can ONLY deliver to the email on your
 * Resend account (tafheemhq@gmail.com). After verifying tafheem.io in Resend,
 * set RESEND_FROM=no-reply@tafheem.io to send anywhere.
 */
import { Resend } from "resend";
import { readFileSync } from "node:fs";
import { join } from "node:path";

function loadEnv() {
  try {
    for (const line of readFileSync(join(process.cwd(), ".env.local"), "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
}
loadEnv();

async function main() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Missing RESEND_API_KEY in platform/.env.local");
    process.exit(1);
  }
  const to = process.argv[2] || "tafheemhq@gmail.com";
  const from = process.env.RESEND_FROM || "onboarding@resend.dev";

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: "Tafheem · Resend test",
    html: "<p>Congrats — your <strong>Resend integration</strong> works. 🌙</p>",
  });

  if (error) {
    console.error("Send failed:", error);
    process.exit(1);
  }
  console.log(`Sent to ${to} from ${from}. Resend id:`, data?.id);
}

main();
