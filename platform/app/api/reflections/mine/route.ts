import { ok, handleError } from "@/lib/errors";
import { requireAuth } from "@/lib/guards/requireAuth";
import { listMine } from "@/lib/services/reflection.service";

export async function GET(req: Request) {
  try {
    const { user, supabase } = await requireAuth(req);
    const url = new URL(req.url);
    const tag = url.searchParams.get("tag") ?? undefined;
    const surah = url.searchParams.get("surah");
    const ayah = url.searchParams.get("ayah");
    const reflections = await listMine(supabase, user.id, {
      tag,
      surah: surah ? Number(surah) : undefined,
      ayah: ayah ? Number(ayah) : undefined,
    });
    return ok(reflections);
  } catch (err) {
    return handleError(err);
  }
}
