import { ok, handleError } from "@/lib/errors";
import { requireRole } from "@/lib/guards/requireRole";
import { createServiceClient } from "@/lib/supabase/server";
import { getQueue } from "@/lib/services/moderation.service";

export async function GET(req: Request) {
  try {
    await requireRole(req, ["moderator", "admin"]);
    const url = new URL(req.url);
    const status = url.searchParams.get("status") === "reviewed" ? "reviewed" : "pending";
    const db = createServiceClient();
    return ok(await getQueue(db, status));
  } catch (err) {
    return handleError(err);
  }
}
