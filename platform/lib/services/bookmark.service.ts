import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import type { Bookmark } from "@/lib/types";
import { Errors } from "@/lib/errors";

type DB = SupabaseClient<Database>;

const COLS = "id, user_id, surah_number, ayah_number, created_at";

export async function addBookmark(
  db: DB,
  userId: string,
  surah: number,
  ayah: number
): Promise<Bookmark> {
  const { data, error } = await db
    .from("bookmarks")
    .upsert(
      { user_id: userId, surah_number: surah, ayah_number: ayah },
      { onConflict: "user_id,surah_number,ayah_number", ignoreDuplicates: false }
    )
    .select(COLS)
    .single();
  if (error) throw Errors.internal("Failed to add bookmark");
  return data as Bookmark;
}

export async function removeBookmark(
  db: DB,
  userId: string,
  surah: number,
  ayah: number
): Promise<void> {
  const { error } = await db
    .from("bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("surah_number", surah)
    .eq("ayah_number", ayah);
  if (error) throw Errors.internal("Failed to remove bookmark");
}

export async function listBookmarks(db: DB, userId: string): Promise<Bookmark[]> {
  const { data, error } = await db
    .from("bookmarks")
    .select(COLS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw Errors.internal("Failed to load bookmarks");
  return (data ?? []) as Bookmark[];
}
