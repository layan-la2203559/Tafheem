import { okMessage, handleError } from "@/lib/errors";
import { parse, registerSchema } from "@/lib/validation";
import { registerUser } from "@/lib/services/auth.service";

export async function POST(req: Request) {
  try {
    const input = parse(registerSchema, await req.json());
    await registerUser(input);
    return okMessage("Check your email to verify your account", 201);
  } catch (err) {
    return handleError(err);
  }
}
