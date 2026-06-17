import { ok, okMessage, handleError } from "@/lib/errors";
import { requireAuth } from "@/lib/guards/requireAuth";
import { parse, updateReflectionSchema } from "@/lib/validation";
import {
  getReflection,
  updateReflection,
  deleteReflection,
} from "@/lib/services/reflection.service";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { user, supabase } = await requireAuth(req);
    return ok(await getReflection(supabase, user.id, params.id));
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { user, supabase } = await requireAuth(req);
    const input = parse(updateReflectionSchema, await req.json());
    return ok(await updateReflection(supabase, user.id, params.id, input));
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { user, supabase } = await requireAuth(req);
    await deleteReflection(supabase, user.id, params.id);
    return okMessage("Reflection deleted");
  } catch (err) {
    return handleError(err);
  }
}
