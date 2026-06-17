import { ok, handleError, Errors } from "@/lib/errors";
import { requireAuth } from "@/lib/guards/requireAuth";
import { getByRoot } from "@/lib/services/quran.service";

export async function GET(req: Request, { params }: { params: { root: string } }) {
  try {
    const { supabase } = await requireAuth(req);
    const root = decodeURIComponent(params.root).trim();
    if (!root) throw Errors.badRequest("root is required");
    return ok(await getByRoot(supabase, root));
  } catch (err) {
    return handleError(err);
  }
}
