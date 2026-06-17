import { ok, handleError } from "@/lib/errors";
import { requireAuth } from "@/lib/guards/requireAuth";
import { listSurahs } from "@/lib/services/quran.service";

export async function GET(req: Request) {
  try {
    await requireAuth(req);
    return ok(listSurahs());
  } catch (err) {
    return handleError(err);
  }
}
