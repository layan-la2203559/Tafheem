-- ============================================================================
-- Tafheem Phase 1 MVP — 0006_word_meaning
-- Add basic word-by-word fields populated from the Quran.com API
-- (seed-words.ts). The classical lexicon columns (root, part_of_speech,
-- morphology, mufradat_meaning, lanes_meaning) stay for the proper datasets
-- (Quranic Arabic Corpus, Mufradat, Lane's) + scholar review later.
-- ============================================================================

alter table public.quran_words add column if not exists translation_en text;
alter table public.quran_words add column if not exists transliteration text;
