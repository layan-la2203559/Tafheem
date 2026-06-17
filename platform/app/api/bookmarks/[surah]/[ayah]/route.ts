import { okMessage, handleError, Errors } from "@/lib/errors";
import { requireAuth } from "@/lib/guards/requireAuth";
import { removeBookmark } from "@/lib/services/bookmark.service";

export async function DELETE(
  req: Request,
  { params }: { params: { surah: string; ayah: string } }
) {
  try {
    const { user, supabase } = await requireAuth(req);
    const surah = Number(params.surah);
    const ayah = Number(params.ayah);
    if (!Number.isInteger(surah) || !Number.isInteger(ayah) || surah < 1 || ayah < 1) {
      throw Errors.badRequest("Invalid surah/ayah");
    }
    await removeBookmark(supabase, user.id, surah, ayah);
    return okMessage("Bookmark removed");
  } catch (err) {
    return handleError(err);
  }
}
