import { ok, handleError } from "@/lib/errors";
import { requireRole } from "@/lib/guards/requireRole";
import { createServiceClient } from "@/lib/supabase/server";
import { getLog } from "@/lib/services/moderation.service";

export async function GET(req: Request) {
  try {
    await requireRole(req, ["moderator", "admin"]);
    const db = createServiceClient();
    return ok(await getLog(db));
  } catch (err) {
    return handleError(err);
  }
}
