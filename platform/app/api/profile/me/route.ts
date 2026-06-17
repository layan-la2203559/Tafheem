import { ok, handleError } from "@/lib/errors";
import { requireAuth } from "@/lib/guards/requireAuth";
import { parse, updateProfileSchema } from "@/lib/validation";
import { getProfile, updateProfile } from "@/lib/services/profile.service";

export async function GET(req: Request) {
  try {
    const { user, supabase } = await requireAuth(req);
    return ok(await getProfile(supabase, user.id));
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(req: Request) {
  try {
    const { user, supabase } = await requireAuth(req);
    const input = parse(updateProfileSchema, await req.json());
    return ok(await updateProfile(supabase, user.id, input));
  } catch (err) {
    return handleError(err);
  }
}
