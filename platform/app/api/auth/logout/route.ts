import { okMessage, handleError } from "@/lib/errors";
import { requireAuth } from "@/lib/guards/requireAuth";
import { logoutUser } from "@/lib/services/auth.service";

export async function POST(req: Request) {
  try {
    const { token } = await requireAuth(req);
    await logoutUser(token);
    return okMessage("Signed out");
  } catch (err) {
    return handleError(err);
  }
}
