import { ok, handleError } from "@/lib/errors";
import { requireAuth } from "@/lib/guards/requireAuth";
import { parse, createReflectionSchema } from "@/lib/validation";
import { createReflection } from "@/lib/services/reflection.service";

export async function POST(req: Request) {
  try {
    const { user, supabase } = await requireAuth(req);
    const input = parse(createReflectionSchema, await req.json());
    const reflection = await createReflection(supabase, user.id, input);
    return ok(reflection, 201);
  } catch (err) {
    return handleError(err);
  }
}
