import { ok, handleError } from "@/lib/errors";
import { requireRole } from "@/lib/guards/requireRole";
import { createServiceClient } from "@/lib/supabase/server";
import { parse, modActionSchema } from "@/lib/validation";
import { performAction } from "@/lib/services/moderation.service";

export async function POST(req: Request) {
  try {
    const { user } = await requireRole(req, ["moderator", "admin"]);
    const input = parse(modActionSchema, await req.json());
    const db = createServiceClient();
    return ok(await performAction(db, user.id, input));
  } catch (err) {
    return handleError(err);
  }
}
