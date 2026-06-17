import { ok, handleError, Errors } from "@/lib/errors";
import { requireAuth } from "@/lib/guards/requireAuth";
import { getSurah } from "@/lib/services/quran.service";

export async function GET(req: Request, { params }: { params: { num: string } }) {
  try {
    const { supabase } = await requireAuth(req);
    const num = Number(params.num);
    if (!Number.isInteger(num) || num < 1 || num > 114) {
      throw Errors.badRequest("surah must be 1–114");
    }
    return ok(await getSurah(supabase, num));
  } catch (err) {
    return handleError(err);
  }
}
