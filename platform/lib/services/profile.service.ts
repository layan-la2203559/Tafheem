import type { SupabaseClient } from "@supabase/supabase-js";
import type { z } from "zod";
import type { Database } from "@/lib/database.types";
import type { Profile, Reflection, Bookmark } from "@/lib/types";
import type { updateProfileSchema, onboardingSchema } from "@/lib/validation";
import { Errors } from "@/lib/errors";

type DB = SupabaseClient<Database>;

const PROFILE_COLS =
  "id, display_name, gender, country, bio, role, suspended, banned, created_at";
const REFLECTION_COLS =
  "id, user_id, surah_number, ayah_number, body, privacy, is_published, published_body, tags, created_at, updated_at";

export async function getProfile(db: DB, userId: string): Promise<Profile> {
  const { data, error } = await db
    .from("profiles")
    .select(PROFILE_COLS)
    .eq("id", userId)
    .maybeSingle();
  if (error) throw Errors.internal("Failed to load profile");
  if (!data) throw Errors.notFound("Profile not found");
  return data as Profile;
}

/** Update display_name / bio only. Gender + country are immutable post-signup. */
export async function updateProfile(
  db: DB,
  userId: string,
  input: z.infer<typeof updateProfileSchema>
): Promise<Profile> {
  const patch: Database["public"]["Tables"]["profiles"]["Update"] = {};
  if (input.display_name !== undefined) patch.display_name = input.display_name;
  if (input.bio !== undefined) patch.bio = input.bio;

  const { data, error } = await db
    .from("profiles")
    .update(patch)
    .eq("id", userId)
    .select(PROFILE_COLS)
    .single();
  if (error) throw Errors.internal("Failed to update profile");
  return data as Profile;
}

export interface Dashboard {
  private_reflections: Reflection[];
  public_reflections: Reflection[];
  bookmarks: Bookmark[];
}

export async function getDashboard(db: DB, userId: string): Promise<Dashboard> {
  const [reflectionsRes, bookmarksRes] = await Promise.all([
    db
      .from("reflections")
      .select(REFLECTION_COLS)
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    db
      .from("bookmarks")
      .select("id, user_id, surah_number, ayah_number, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  if (reflectionsRes.error) throw Errors.internal("Failed to load reflections");
  if (bookmarksRes.error) throw Errors.internal("Failed to load bookmarks");

  const reflections = (reflectionsRes.data ?? []) as Reflection[];
  return {
    private_reflections: reflections.filter((r) => !r.is_published),
    public_reflections: reflections.filter((r) => r.is_published),
    bookmarks: (bookmarksRes.data ?? []) as Bookmark[],
  };
}

export async function submitOnboarding(
  db: DB,
  userId: string,
  input: z.infer<typeof onboardingSchema>
): Promise<void> {
  const { error } = await db.from("onboarding_survey").upsert(
    {
      user_id: userId,
      background: input.background ?? null,
      primary_goal: input.primary_goal ?? null,
      reflection_style: input.reflection_style ?? null,
    },
    { onConflict: "user_id" }
  );
  if (error) throw Errors.internal("Failed to save survey");
}
