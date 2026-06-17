import { ok, handleError, Errors } from "@/lib/errors";
import { requireAuth } from "@/lib/guards/requireAuth";
import { getVerse } from "@/lib/services/quran.service";

export async function GET(
  req: Request,
  { params }: { params: { surah: string; ayah: string } }
) {
  try {
    const { supabase } = await requireAuth(req);
    const surah = Number(params.surah);
    const ayah = Number(params.ayah);
    if (!Number.isInteger(surah) || !Number.isInteger(ayah) || surah < 1 || ayah < 1) {
      throw Errors.badRequest("Invalid surah/ayah");
    }
    return ok(await getVerse(supabase, surah, ayah));
  } catch (err) {
    return handleError(err);
  }
}
