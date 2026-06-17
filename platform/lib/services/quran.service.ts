import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import type { QuranVerse, WordTabs } from "@/lib/types";
import { SURAHS } from "@/lib/quran-surahs";
import { Errors } from "@/lib/errors";

type DB = SupabaseClient<Database>;

const WORD_COLS =
  "word_position, arabic_text, transliteration, translation_en, root, part_of_speech, morphology, mufradat_meaning, lanes_meaning";

function mapWordRow(row: any): WordTabs {
  return {
    position: row.word_position,
    arabic_text: row.arabic_text ?? null,
    transliteration: row.transliteration ?? null,
    translation_en: row.translation_en ?? null,
    root: row.root ?? null,
    part_of_speech: row.part_of_speech ?? null,
    tabs: {
      morphology: row.morphology ?? null,
      mufradat: row.mufradat_meaning ?? null,
      lanes: row.lanes_meaning ?? null,
    },
  };
}

function emptyWord(position: number): WordTabs {
  return {
    position,
    arabic_text: null,
    transliteration: null,
    translation_en: null,
    root: null,
    part_of_speech: null,
    tabs: { morphology: null, mufradat: null, lanes: null },
  };
}

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
    .select(WORD_COLS)
    .eq("surah_number", surah)
    .eq("ayah_number", ayah)
    .eq("word_position", position)
    .maybeSingle();
  if (error) throw Errors.internal("Failed to load word data");

  return data ? mapWordRow(data) : emptyWord(position);
}

/**
 * All words of a surah, in order, grouped by ayah. This is the correct source
 * for rendering tappable words — positions come straight from the word-by-word
 * data, so waqf (pause) marks in the verse text never misalign them.
 */
export async function getSurahWords(
  db: DB,
  surah: number
): Promise<(WordTabs & { ayah_number: number })[]> {
  const { data, error } = await db
    .from("quran_words")
    .select(`ayah_number, ${WORD_COLS}`)
    .eq("surah_number", surah)
    .order("ayah_number", { ascending: true })
    .order("word_position", { ascending: true });
  if (error) throw Errors.internal("Failed to load surah words");
  return (data ?? []).map((row: any) => ({
    ayah_number: row.ayah_number,
    ...mapWordRow(row),
  }));
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
