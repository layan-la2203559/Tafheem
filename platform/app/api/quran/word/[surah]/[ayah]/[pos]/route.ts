import { ok, handleError, Errors } from "@/lib/errors";
import { requireAuth } from "@/lib/guards/requireAuth";
import { getWord } from "@/lib/services/quran.service";

export async function GET(
  req: Request,
  { params }: { params: { surah: string; ayah: string; pos: string } }
) {
  try {
    const { supabase } = await requireAuth(req);
    const surah = Number(params.surah);
    const ayah = Number(params.ayah);
    const pos = Number(params.pos);
    if (
      !Number.isInteger(surah) ||
      !Number.isInteger(ayah) ||
      !Number.isInteger(pos) ||
      surah < 1 ||
      ayah < 1 ||
      pos < 1
    ) {
      throw Errors.badRequest("Invalid surah/ayah/position");
    }
    return ok(await getWord(supabase, surah, ayah, pos));
  } catch (err) {
    return handleError(err);
  }
}
