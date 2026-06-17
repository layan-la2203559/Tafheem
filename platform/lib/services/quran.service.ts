import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import type { QuranVerse, WordTabs } from "@/lib/types";
import { SURAHS } from "@/lib/quran-surahs";
import { Errors } from "@/lib/errors";

type DB = SupabaseClient<Database>;

/** Static surah list (works before quran_verses is seeded). */
export function listSurahs() {
  return SURAHS;
}

export async function getSurah(db: DB, surah: number): Promise<QuranVerse[]> {
  const { data, error } = await db
    .from("quran_verses")
    .select("surah_number, ayah_number, arabic_text, translation_en")
    .eq("surah_number", surah)
    .order("ayah_number", { ascending: true });
  if (error) throw Errors.internal("Failed to load surah");
  return (data ?? []) as QuranVerse[];
}

export async function getVerse(
  db: DB,
  surah: number,
  ayah: number
): Promise<QuranVerse> {
  const { data, error } = await db
    .from("quran_verses")
    .select("surah_number, ayah_number, arabic_text, translation_en")
    .eq("surah_number", surah)
    .eq("ayah_number", ayah)
    .maybeSingle();
  if (error) throw Errors.internal("Failed to load verse");
  if (!data) throw Errors.notFound("Verse not found");
  return data as QuranVerse;
}

/**
 * Word pop-up data (all 3 tabs). Lexicon (quran_words) may not be seeded yet —
 * return empty tabs gracefully instead of 404/500 so the UI still renders.
 */
export async function getWord(
  db: DB,
  surah: number,
  ayah: number,
  position: number
): Promise<WordTabs> {
  const { data, error } = await db
    .from("quran_words")
    .select(
      "word_position, arabic_text, transliteration, translation_en, root, part_of_speech, morphology, mufradat_meaning, lanes_meaning"
    )
    .eq("surah_number", surah)
    .eq("ayah_number", ayah)
    .eq("word_position", position)
    .maybeSingle();
  if (error) throw Errors.internal("Failed to load word data");

  return {
    position,
    arabic_text: data?.arabic_text ?? null,
    transliteration: data?.transliteration ?? null,
    translation_en: data?.translation_en ?? null,
    root: data?.root ?? null,
    part_of_speech: data?.part_of_speech ?? null,
    tabs: {
      morphology: data?.morphology ?? null,
      mufradat: data?.mufradat_meaning ?? null,
      lanes: data?.lanes_meaning ?? null,
    },
  };
}

/** All verses that contain a word sharing the given root. */
export async function getByRoot(db: DB, root: string): Promise<QuranVerse[]> {
  const { data: words, error: wErr } = await db
    .from("quran_words")
    .select("surah_number, ayah_number")
    .eq("root", root);
  if (wErr) throw Errors.internal("Failed to look up root");

  const verseKeys = uniqueVerseKeys(words ?? []);
  if (verseKeys.length === 0) return [];
  return fetchVerses(db, verseKeys);
}

/**
 * Basic "similar verses": verses (other than this one) that share at least one
 * root word with the given verse. Returns [] gracefully when lexicon unseeded.
 */
export async function getSimilar(
  db: DB,
  surah: number,
  ayah: number
): Promise<QuranVerse[]> {
  const { data: ownWords, error: oErr } = await db
    .from("quran_words")
    .select("root")
    .eq("surah_number", surah)
    .eq("ayah_number", ayah);
  if (oErr) throw Errors.internal("Failed to load verse words");

  const roots = Array.from(
    new Set((ownWords ?? []).map((w) => w.root).filter((r): r is string => !!r))
  );
  if (roots.length === 0) return [];

  const { data: matches, error: mErr } = await db
    .from("quran_words")
    .select("surah_number, ayah_number")
    .in("root", roots);
  if (mErr) throw Errors.internal("Failed to find similar verses");

  const verseKeys = uniqueVerseKeys(matches ?? []).filter(
    (k) => !(k.surah_number === surah && k.ayah_number === ayah)
  );
  if (verseKeys.length === 0) return [];
  return fetchVerses(db, verseKeys.slice(0, 50));
}

// ---------- helpers ---------------------------------------------------------
interface VerseKey {
  surah_number: number;
  ayah_number: number;
}

function uniqueVerseKeys(rows: VerseKey[]): VerseKey[] {
  const seen = new Set<string>();
  const out: VerseKey[] = [];
  for (const r of rows) {
    const k = `${r.surah_number}:${r.ayah_number}`;
    if (!seen.has(k)) {
      seen.add(k);
      out.push({ surah_number: r.surah_number, ayah_number: r.ayah_number });
    }
  }
  return out;
}

async function fetchVerses(db: DB, keys: VerseKey[]): Promise<QuranVerse[]> {
  // Build an OR filter across (surah, ayah) pairs.
  const orFilter = keys
    .map((k) => `and(surah_number.eq.${k.surah_number},ayah_number.eq.${k.ayah_number})`)
    .join(",");
  const { data, error } = await db
    .from("quran_verses")
    .select("surah_number, ayah_number, arabic_text, translation_en")
    .or(orFilter)
    .order("surah_number", { ascending: true })
    .order("ayah_number", { ascending: true });
  if (error) throw Errors.internal("Failed to load verses");
  return (data ?? []) as QuranVerse[];
}
