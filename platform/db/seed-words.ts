/**
 * Seed `quran_words` with basic word-by-word data from the Quran.com API (v4):
 * Arabic word + short English meaning + transliteration + position.
 *
 *   npm run seed:words
 *
 * This is the stopgap layer. The classical lexicon columns (root,
 * part_of_speech, morphology, mufradat_meaning, lanes_meaning) are filled
 * separately later from the Quranic Arabic Corpus + Mufradat + Lane's, after
 * scholar review. Run AFTER seed:quran. Requires the same env as seed-quran.ts.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

function loadEnv() {
  try {
    const file = readFileSync(join(process.cwd(), ".env.local"), "utf8");
    for (const line of file.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    /* rely on real environment */
  }
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TOTAL_SURAHS = 114;
const REQUEST_DELAY_MS = 350;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in platform/.env.local"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface ApiWord {
  position: number;
  char_type_name: string; // "word" | "end"
  text_uthmani: string;
  translation?: { text: string };
  transliteration?: { text: string | null };
}
interface ApiVerse {
  verse_number: number;
  words?: ApiWord[];
}

async function fetchChapterWords(chapter: number): Promise<ApiVerse[]> {
  const all: ApiVerse[] = [];
  let page = 1;
  for (;;) {
    const url =
      `https://api.quran.com/api/v4/verses/by_chapter/${chapter}` +
      `?language=en&words=true&word_fields=text_uthmani,transliteration` +
      `&per_page=50&page=${page}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Chapter ${chapter} page ${page} -> HTTP ${res.status}`);
    const json = (await res.json()) as {
      verses: ApiVerse[];
      pagination: { next_page: number | null };
    };
    all.push(...json.verses);
    if (!json.pagination?.next_page) break;
    page = json.pagination.next_page;
    await sleep(REQUEST_DELAY_MS);
  }
  return all;
}

async function main() {
  console.log("Seeding quran_words (basic word-by-word) from Quran.com API…");
  let total = 0;

  for (let chapter = 1; chapter <= TOTAL_SURAHS; chapter++) {
    const verses = await fetchChapterWords(chapter);
    const rows: Record<string, unknown>[] = [];

    for (const v of verses) {
      for (const w of v.words ?? []) {
        if (w.char_type_name !== "word") continue; // skip ayah-end markers
        rows.push({
          surah_number: chapter,
          ayah_number: v.verse_number,
          word_position: w.position,
          arabic_text: w.text_uthmani ?? null,
          translation_en: w.translation?.text ?? null,
          transliteration: w.transliteration?.text ?? null,
        });
      }
    }

    if (rows.length) {
      const { error } = await supabase
        .from("quran_words")
        .upsert(rows, { onConflict: "surah_number,ayah_number,word_position" });
      if (error) {
        console.error(`  ✗ surah ${chapter}: ${error.message}`);
        process.exit(1);
      }
    }

    total += rows.length;
    console.log(`  ✓ surah ${chapter}: ${rows.length} words (running total ${total})`);
    await sleep(REQUEST_DELAY_MS);
  }

  console.log(`\nDone. Inserted/updated ${total} words (expected ~77,000+).`);
}

main().catch((err) => {
  console.error("Word seeding failed:", err);
  process.exit(1);
});
