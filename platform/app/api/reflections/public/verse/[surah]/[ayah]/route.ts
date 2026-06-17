import { ok, handleError, Errors } from "@/lib/errors";
import { requireAuth } from "@/lib/guards/requireAuth";
import { listPublicForVerse } from "@/lib/services/reflection.service";

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
    return ok(await listPublicForVerse(supabase, surah, ayah));
  } catch (err) {
    return handleError(err);
  }
}
