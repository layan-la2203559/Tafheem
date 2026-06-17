import { ok, handleError } from "@/lib/errors";
import { requireAuth } from "@/lib/guards/requireAuth";
import { parse, createBookmarkSchema } from "@/lib/validation";
import { addBookmark, listBookmarks } from "@/lib/services/bookmark.service";

export async function POST(req: Request) {
  try {
    const { user, supabase } = await requireAuth(req);
    const input = parse(createBookmarkSchema, await req.json());
    const bookmark = await addBookmark(
      supabase,
      user.id,
      input.surah_number,
      input.ayah_number
    );
    return ok(bookmark, 201);
  } catch (err) {
    return handleError(err);
  }
}

export async function GET(req: Request) {
  try {
    const { user, supabase } = await requireAuth(req);
    return ok(await listBookmarks(supabase, user.id));
  } catch (err) {
    return handleError(err);
  }
}
