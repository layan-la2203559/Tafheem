import { ok, handleError } from "@/lib/errors";
import { requireAuth } from "@/lib/guards/requireAuth";
import { publishReflection } from "@/lib/services/reflection.service";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { user, supabase } = await requireAuth(req);
    return ok(await publishReflection(supabase, user.id, params.id));
  } catch (err) {
    return handleError(err);
  }
}
