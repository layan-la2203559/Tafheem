-- ============================================================================
-- Tafheem Phase 1 MVP — 0001_schema
-- Enums + core tables. Apply BEFORE 0002_rls and 0003_triggers.
-- ============================================================================

-- ---------- Enums ----------------------------------------------------------
do $$ begin
  create type gender as enum ('male', 'female');
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_role as enum ('user', 'moderator', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type privacy_level as enum ('private', 'public');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_reason as enum
    ('misuse', 'false_info', 'opinion_as_verdict', 'harassment', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_status as enum ('pending', 'dismissed', 'actioned');
exception when duplicate_object then null; end $$;

do $$ begin
  create type mod_action as enum
    ('dismiss', 'remove_content', 'warn', 'suspend', 'ban');
exception when duplicate_object then null; end $$;

-- ---------- profiles (extends auth.users) ----------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text not null,
  gender        gender not null,           -- immutable (enforced in app + trigger)
  country       text not null,
  bio           text,
  role          user_role not null default 'user',
  suspended     boolean not null default false,
  banned        boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ---------- reflections ----------------------------------------------------
create table if not exists public.reflections (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles (id) on delete cascade,
  surah_number    int not null,
  ayah_number     int not null,
  body            text not null,                       -- Markdown, editable while private
  privacy         privacy_level not null default 'private',
  is_published    boolean not null default false,
  published_body  text,                                -- immutable snapshot at publish
  tags            text[],
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists reflections_user_idx on public.reflections (user_id);
create index if not exists reflections_published_idx
  on public.reflections (is_published) where is_published = true;
create index if not exists reflections_verse_idx
  on public.reflections (surah_number, ayah_number);

-- ---------- bookmarks ------------------------------------------------------
create table if not exists public.bookmarks (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  surah_number  int not null,
  ayah_number   int not null,
  created_at    timestamptz not null default now(),
  unique (user_id, surah_number, ayah_number)
);

-- ---------- quran_verses (cached from Quran.com) ---------------------------
create table if not exists public.quran_verses (
  surah_number    int not null,
  ayah_number     int not null,
  arabic_text     text not null,
  translation_en  text,                                -- Sahih International
  primary key (surah_number, ayah_number)
);

-- ---------- quran_words (lexicon cache) ------------------------------------
create table if not exists public.quran_words (
  id                uuid primary key default gen_random_uuid(),
  surah_number      int not null,
  ayah_number       int not null,
  word_position     int not null,
  arabic_text       text,
  root              text,
  part_of_speech    text,
  morphology        jsonb,                              -- Quranic Arabic Corpus
  mufradat_meaning  text,                               -- Arabic Lexicon tab
  lanes_meaning     text,                               -- Lane's Lexicon tab
  unique (surah_number, ayah_number, word_position)
);
create index if not exists quran_words_root_idx on public.quran_words (root);

-- ---------- reports (reporter identity intentionally NOT stored) -----------
create table if not exists public.reports (
  id                      uuid primary key default gen_random_uuid(),
  reported_reflection_id  uuid references public.reflections (id) on delete set null,
  reported_user_id        uuid references public.profiles (id) on delete set null,
  reason                  report_reason not null,
  other_text              text,
  status                  report_status not null default 'pending',
  created_at              timestamptz not null default now()
);
create index if not exists reports_status_idx on public.reports (status);

-- ---------- moderation_log -------------------------------------------------
create table if not exists public.moderation_log (
  id                    uuid primary key default gen_random_uuid(),
  moderator_id          uuid not null references public.profiles (id),
  action                mod_action not null,
  target_user_id        uuid references public.profiles (id) on delete set null,
  target_reflection_id  uuid references public.reflections (id) on delete set null,
  report_id             uuid references public.reports (id) on delete set null,
  note                  text,
  created_at            timestamptz not null default now()
);

-- ---------- violation_counts -----------------------------------------------
create table if not exists public.violation_counts (
  user_id             uuid primary key references public.profiles (id) on delete cascade,
  valid_report_count  int not null default 0,
  suspended           boolean not null default false,
  banned              boolean not null default false
);

-- ---------- keyword_flags (pre-post audit) ---------------------------------
create table if not exists public.keyword_flags (
  id          uuid primary key default gen_random_uuid(),
  keyword     text not null,
  added_by    uuid references public.profiles (id) on delete set null,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------- onboarding_survey ----------------------------------------------
create table if not exists public.onboarding_survey (
  user_id          uuid primary key references public.profiles (id) on delete cascade,
  background       text,
  primary_goal     text,
  reflection_style text,
  completed_at     timestamptz not null default now()
);
