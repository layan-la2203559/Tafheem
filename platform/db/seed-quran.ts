/**
 * Seed `quran_verses` from the Quran.com API (v4).
 *
 * Fetches Arabic (uthmani) text + Sahih International translation (id 131) for
 * all 114 surahs and upserts into Supabase. Run ONCE before launch:
 *
 *   npm run seed:quran
 *
 * Requires env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * (loaded from platform/.env.local). No live API calls happen during user
 * sessions — the reader reads from this cache.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// --- minimal .env.local loader (no extra dependency) -----------------------
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
    // no .env.local — rely on real environment
  }
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SAHIH_INTERNATIONAL = 20; // Quran.com resource id for Saheeh International
const TOTAL_SURAHS = 114;
const REQUEST_DELAY_MS = 350; // be polite to the public API

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

function stripHtml(s: string): string {
  // Saheeh International text carries <sup foot_note=...>N</sup> markers — drop
  // the whole footnote marker, then any remaining tags, then tidy whitespace.
  return s
    .replace(/<sup[^>]*>.*?<\/sup>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

interface ApiVerse {
  verse_number: number;
  text_uthmani: string;
  translations?: { text: string }[];
}

async function fetchChapter(chapter: number): Promise<ApiVerse[]> {
  const all: ApiVerse[] = [];
  let page = 1;
  // The API paginates (default 50 per page); follow pages until exhausted.
  for (;;) {
    const url =
      `https://api.quran.com/api/v4/verses/by_chapter/${chapter}` +
      `?language=en&words=false&translations=${SAHIH_INTERNATIONAL}` +
      `&fields=text_uthmani&per_page=50&page=${page}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Chapter ${chapter} page ${page} -> HTTP ${res.status}`);
    }
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
  console.log("Seeding quran_verses from Quran.com API…");
  let total = 0;

  for (let chapter = 1; chapter <= TOTAL_SURAHS; chapter++) {
    const verses = await fetchChapter(chapter);
    const rows = verses.map((v) => ({
      surah_number: chapter,
      ayah_number: v.verse_number,
      arabic_text: v.text_uthmani,
      translation_en: v.translations?.[0]?.text
        ? stripHtml(v.translations[0].text)
        : null,
    }));

    const { error } = await supabase
      .from("quran_verses")
      .upsert(rows, { onConflict: "surah_number,ayah_number" });
    if (error) {
      console.error(`  ✗ surah ${chapter}: ${error.message}`);
      process.exit(1);
    }

    total += rows.length;
    console.log(`  ✓ surah ${chapter}: ${rows.length} verses (running total ${total})`);
    await sleep(REQUEST_DELAY_MS);
  }

  console.log(`\nDone. Inserted/updated ${total} verses (expected ~6236).`);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
