import { okMessage, handleError } from "@/lib/errors";
import { parse, forgotPasswordSchema } from "@/lib/validation";
import { forgotPassword } from "@/lib/services/auth.service";

export async function POST(req: Request) {
  try {
    const input = parse(forgotPasswordSchema, await req.json());
    await forgotPassword(input);
    // Always the same response to avoid leaking which emails are registered.
    return okMessage("If that email exists, a reset link has been sent");
  } catch (err) {
    return handleError(err);
  }
}
