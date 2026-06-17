import { okMessage, handleError } from "@/lib/errors";
import { parse, resetPasswordSchema } from "@/lib/validation";
import { resetPassword } from "@/lib/services/auth.service";

export async function POST(req: Request) {
  try {
    const input = parse(resetPasswordSchema, await req.json());
    await resetPassword(input);
    return okMessage("Password updated. You can now sign in.");
  } catch (err) {
    return handleError(err);
  }
}
