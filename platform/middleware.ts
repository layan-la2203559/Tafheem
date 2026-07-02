import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Staging gate — HTTP Basic Auth for the whole app.
 *
 * Only activates when BOTH `STAGING_USER` and `STAGING_PASS` are set in the
 * environment. Set them ONLY on the staging deploy (staging.tafheem.io) so
 * production and local dev are never locked out. This keeps the in-progress
 * MVP private while the design/frontend work is underway.
 *
 * Runs on the Edge runtime, so we use the Web-standard `atob` (not Buffer)
 * to decode the base64 credentials.
 */
export function middleware(req: NextRequest) {
  const user = process.env.STAGING_USER;
  const pass = process.env.STAGING_PASS;

  // No credentials configured (production / local) → do nothing.
  if (!user || !pass) return NextResponse.next();

  const header = req.headers.get("authorization") || "";
  const [scheme, encoded] = header.split(" ");

  if (scheme === "Basic" && encoded) {
    let decoded = "";
    try {
      decoded = atob(encoded);
    } catch {
      decoded = "";
    }
    const sep = decoded.indexOf(":");
    const givenUser = decoded.slice(0, sep);
    const givenPass = decoded.slice(sep + 1);

    if (sep !== -1 && givenUser === user && givenPass === pass) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Tafheem Staging"' },
  });
}

/**
 * Apply to every route EXCEPT Next.js internals and static assets, so the
 * auth prompt covers pages and API but not the framework's own asset requests.
 */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
