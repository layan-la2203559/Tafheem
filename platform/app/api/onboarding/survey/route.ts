import { okMessage, handleError } from "@/lib/errors";
import { requireAuth } from "@/lib/guards/requireAuth";
import { parse, onboardingSchema } from "@/lib/validation";
import { submitOnboarding } from "@/lib/services/profile.service";

export async function POST(req: Request) {
  try {
    const { user, supabase } = await requireAuth(req);
    const input = parse(onboardingSchema, await req.json());
    await submitOnboarding(supabase, user.id, input);
    return okMessage("Survey saved", 201);
  } catch (err) {
    return handleError(err);
  }
}
