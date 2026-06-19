import type { SupabaseClient } from "@supabase/supabase-js";
import type { z } from "zod";
import type { Database } from "@/lib/database.types";
import type { Reflection, PublicReflection } from "@/lib/types";
import type {
  createReflectionSchema,
  updateReflectionSchema,
} from "@/lib/validation";
import { Errors } from "@/lib/errors";
import { runAudit } from "@/lib/guards/runAudit";
import { sanitizeReflectionHtml, htmlToText } from "@/lib/sanitize";

type DB = SupabaseClient<Database>;

const REFLECTION_COLS =
  "id, user_id, surah_number, ayah_number, body, privacy, is_published, published_body, tags, created_at, updated_at";

const NEW_WINDOW_MS = 48 * 60 * 60 * 1000;

export async function createReflection(
  db: DB,
  userId: string,
  input: z.infer<typeof createReflectionSchema>
): Promise<Reflection> {
  const body = sanitizeReflectionHtml(input.body);
  if (!htmlToText(body)) throw Errors.badRequest("Reflection body is required");

  const { data, error } = await db
    .from("reflections")
    .insert({
      user_id: userId,
      surah_number: input.surah_number,
      ayah_number: input.ayah_number,
      body,
      tags: input.tags ?? null,
      privacy: "private",
      is_published: false,
    })
    .select(REFLECTION_COLS)
    .single();
  if (error) throw Errors.internal("Failed to create reflection");
  return data as Reflection;
}

export interface MineFilters {
  tag?: string;
  surah?: number;
  ayah?: number;
}

export async function listMine(
  db: DB,
  userId: string,
  filters: MineFilters
): Promise<Reflection[]> {
  let q = db
    .from("reflections")
    .select(REFLECTION_COLS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (filters.surah) q = q.eq("surah_number", filters.surah);
  if (filters.ayah) q = q.eq("ayah_number", filters.ayah);
  if (filters.tag) q = q.contains("tags", [filters.tag]);

  const { data, error } = await q;
  if (error) throw Errors.internal("Failed to load reflections");
  return (data ?? []) as Reflection[];
}

/** Get one reflection. Own (any privacy) or any published reflection. */
export async function getReflection(
  db: DB,
  userId: string,
  id: string
): Promise<Reflection> {
  const { data, error } = await db
    .from("reflections")
    .select(REFLECTION_COLS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw Errors.internal("Failed to load reflection");
  if (!data) throw Errors.notFound("Reflection not found");

  const r = data as Reflection;
  if (r.user_id !== userId && !r.is_published) {
    // RLS would already hide it; this is belt-and-braces.
    throw Errors.notFound("Reflection not found");
  }
  return r;
}

export async function updateReflection(
  db: DB,
  userId: string,
  id: string,
  input: z.infer<typeof updateReflectionSchema>
): Promise<Reflection> {
  // Only the private (unpublished) copy is editable.
  const existing = await ownedReflection(db, userId, id);
  if (existing.is_published) {
    throw Errors.badRequest("Published reflections cannot be edited");
  }

  const patch: Database["public"]["Tables"]["reflections"]["Update"] = {};
  if (input.body !== undefined) {
    const body = sanitizeReflectionHtml(input.body);
    if (!htmlToText(body)) throw Errors.badRequest("Reflection body is required");
    patch.body = body;
  }
  if (input.tags !== undefined) patch.tags = input.tags;

  const { data, error } = await db
    .from("reflections")
    .update(patch)
    .eq("id", id)
    .eq("user_id", userId)
    .select(REFLECTION_COLS)
    .single();
  if (error) throw Errors.internal("Failed to update reflection");
  return data as Reflection;
}

export async function deleteReflection(
  db: DB,
  userId: string,
  id: string
): Promise<void> {
  await ownedReflection(db, userId, id); // 404 if not owner/exists
  const { error } = await db
    .from("reflections")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw Errors.internal("Failed to delete reflection");
}

/**
 * Publish: run the pre-post audit, then flip is_published. The DB trigger
 * snapshots body -> published_body. On a keyword hit we return a GENERIC 400 —
 * never revealing which keyword matched.
 */
export async function publishReflection(
  db: DB,
  userId: string,
  id: string
): Promise<Reflection> {
  const existing = await ownedReflection(db, userId, id);
  if (existing.is_published) {
    throw Errors.badRequest("This reflection is already published");
  }

  // Audit against the plain-text version so HTML tags can't split keywords.
  const audit = await runAudit(htmlToText(existing.body));
  if (audit.flagged) {
    throw Errors.badRequest(
      "Your reflection contains flagged content. Please revise and try again."
    );
  }

  const { data, error } = await db
    .from("reflections")
    .update({ is_published: true, privacy: "public" })
    .eq("id", id)
    .eq("user_id", userId)
    .select(REFLECTION_COLS)
    .single();
  if (error) throw Errors.internal("Failed to publish reflection");
  return data as Reflection;
}

export interface PublicFilters {
  tag?: string;
  surah?: number;
  ayah?: number;
}

/**
 * Community feed: published reflections in random order, each tagged with
 * `is_new` (< 48h). Joins profiles for display_name.
 */
export async function listPublic(
  db: DB,
  filters: PublicFilters
): Promise<PublicReflection[]> {
  let q = db
    .from("reflections")
    .select(
      "id, user_id, surah_number, ayah_number, published_body, tags, created_at, profiles!inner(display_name)"
    )
    .eq("is_published", true);

  if (filters.surah) q = q.eq("surah_number", filters.surah);
  if (filters.ayah) q = q.eq("ayah_number", filters.ayah);
  if (filters.tag) q = q.contains("tags", [filters.tag]);

  const { data, error } = await q;
  if (error) throw Errors.internal("Failed to load public reflections");

  const now = Date.now();
  const rows = (data ?? []).map((r: any) => ({
    id: r.id,
    user_id: r.user_id,
    display_name: r.profiles?.display_name ?? "Anonymous",
    surah_number: r.surah_number,
    ayah_number: r.ayah_number,
    published_body: r.published_body ?? "",
    tags: r.tags ?? null,
    created_at: r.created_at,
    is_new: now - new Date(r.created_at).getTime() < NEW_WINDOW_MS,
  })) as PublicReflection[];

  // Random order (feed requirement). Shuffle in app layer rather than
  // ORDER BY RANDOM() so we can keep the profiles join simple.
  return shuffle(rows);
}

export async function listPublicForVerse(
  db: DB,
  surah: number,
  ayah: number
): Promise<PublicReflection[]> {
  return listPublic(db, { surah, ayah });
}

// ---------- helpers ---------------------------------------------------------
async function ownedReflection(
  db: DB,
  userId: string,
  id: string
): Promise<Reflection> {
  const { data, error } = await db
    .from("reflections")
    .select(REFLECTION_COLS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw Errors.internal("Failed to load reflection");
  if (!data || (data as Reflection).user_id !== userId) {
    throw Errors.notFound("Reflection not found");
  }
  return data as Reflection;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
