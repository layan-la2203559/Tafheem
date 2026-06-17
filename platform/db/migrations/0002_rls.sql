-- ============================================================================
-- Tafheem Phase 1 MVP — 0002_rls
-- Row-Level Security. Apply AFTER 0001_schema.
-- Note: the service-role key bypasses RLS (used for seeding + moderation writes).
-- These policies govern the per-user (anon-key / bearer) clients.
-- ============================================================================

-- ---------- Role helpers (SECURITY DEFINER => no policy recursion) ----------
create or replace function public.is_mod_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('moderator', 'admin')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------- Enable RLS ------------------------------------------------------
alter table public.profiles          enable row level security;
alter table public.reflections       enable row level security;
alter table public.bookmarks         enable row level security;
alter table public.quran_verses      enable row level security;
alter table public.quran_words       enable row level security;
alter table public.reports           enable row level security;
alter table public.moderation_log    enable row level security;
alter table public.violation_counts  enable row level security;
alter table public.keyword_flags     enable row level security;
alter table public.onboarding_survey enable row level security;

-- ---------- profiles -------------------------------------------------------
drop policy if exists profiles_select_all on public.profiles;
create policy profiles_select_all on public.profiles
  for select to authenticated using (true);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- ---------- reflections ----------------------------------------------------
drop policy if exists reflections_select_own on public.reflections;
create policy reflections_select_own on public.reflections
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists reflections_select_published on public.reflections;
create policy reflections_select_published on public.reflections
  for select to authenticated using (is_published = true);

drop policy if exists reflections_insert_own on public.reflections;
create policy reflections_insert_own on public.reflections
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists reflections_update_own on public.reflections;
create policy reflections_update_own on public.reflections
  for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists reflections_delete_own on public.reflections;
create policy reflections_delete_own on public.reflections
  for delete to authenticated using (auth.uid() = user_id);

-- ---------- bookmarks ------------------------------------------------------
drop policy if exists bookmarks_all_own on public.bookmarks;
create policy bookmarks_all_own on public.bookmarks
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- quran_verses / quran_words (read-only reference) ---------------
drop policy if exists quran_verses_read on public.quran_verses;
create policy quran_verses_read on public.quran_verses
  for select to authenticated using (true);

drop policy if exists quran_words_read on public.quran_words;
create policy quran_words_read on public.quran_words
  for select to authenticated using (true);

-- ---------- reports (anonymous; reporter identity never stored) ------------
drop policy if exists reports_insert_any on public.reports;
create policy reports_insert_any on public.reports
  for insert to authenticated with check (true);

drop policy if exists reports_select_mod on public.reports;
create policy reports_select_mod on public.reports
  for select to authenticated using (is_mod_or_admin());

-- ---------- moderation_log -------------------------------------------------
drop policy if exists modlog_select_mod on public.moderation_log;
create policy modlog_select_mod on public.moderation_log
  for select to authenticated using (is_mod_or_admin());

drop policy if exists modlog_insert_mod on public.moderation_log;
create policy modlog_insert_mod on public.moderation_log
  for insert to authenticated with check (is_mod_or_admin());

-- ---------- violation_counts -----------------------------------------------
drop policy if exists violation_select on public.violation_counts;
create policy violation_select on public.violation_counts
  for select to authenticated
  using (auth.uid() = user_id or is_mod_or_admin());

-- ---------- keyword_flags --------------------------------------------------
drop policy if exists keywords_select_mod on public.keyword_flags;
create policy keywords_select_mod on public.keyword_flags
  for select to authenticated using (is_mod_or_admin());

drop policy if exists keywords_insert_admin on public.keyword_flags;
create policy keywords_insert_admin on public.keyword_flags
  for insert to authenticated with check (is_admin());

drop policy if exists keywords_delete_admin on public.keyword_flags;
create policy keywords_delete_admin on public.keyword_flags
  for delete to authenticated using (is_admin());

-- ---------- onboarding_survey ----------------------------------------------
drop policy if exists onboarding_all_own on public.onboarding_survey;
create policy onboarding_all_own on public.onboarding_survey
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
