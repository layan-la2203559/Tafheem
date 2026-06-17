import { ok, handleError } from "@/lib/errors";
import { requireAuth } from "@/lib/guards/requireAuth";
import { getDashboard } from "@/lib/services/profile.service";

export async function GET(req: Request) {
  try {
    const { user, supabase } = await requireAuth(req);
    return ok(await getDashboard(supabase, user.id));
  } catch (err) {
    return handleError(err);
  }
}
