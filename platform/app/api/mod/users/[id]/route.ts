import { ok, handleError } from "@/lib/errors";
import { requireRole } from "@/lib/guards/requireRole";
import { createServiceClient } from "@/lib/supabase/server";
import { getUserHistory } from "@/lib/services/moderation.service";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, ["moderator", "admin"]);
    const db = createServiceClient();
    return ok(await getUserHistory(db, params.id));
  } catch (err) {
    return handleError(err);
  }
}
