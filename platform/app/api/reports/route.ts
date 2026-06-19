import { ok, handleError } from "@/lib/errors";
import { requireAuth } from "@/lib/guards/requireAuth";
import { enforceRateLimit } from "@/lib/guards/rateLimit";
import { parse, createReportSchema } from "@/lib/validation";
import { submitReport } from "@/lib/services/report.service";

export async function POST(req: Request) {
  try {
    // Auth is required to submit, but the reporter's identity is NOT stored.
    const { user } = await requireAuth(req);
    // Anti-spam: cap reports per user (the reporter id isn't persisted, but we
    // can still throttle within the request using the authenticated user).
    enforceRateLimit(user.id, { key: "report", limit: 20, windowMs: 60 * 60 * 1000 });
    const input = parse(createReportSchema, await req.json());
    const result = await submitReport(input);
    return ok(result, 201);
  } catch (err) {
    return handleError(err);
  }
}
