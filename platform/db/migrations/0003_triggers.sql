-- ============================================================================
-- Tafheem Phase 1 MVP — 0003_triggers
-- Auto-profile creation, immutable published_body, immutable gender, updated_at.
-- Apply AFTER 0001_schema (and 0002_rls).
-- ============================================================================

-- ---------- Auto-create profile + violation row on signup ------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, gender, country)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', 'Anonymous'),
    (new.raw_user_meta_data->>'gender')::gender,
    coalesce(new.raw_user_meta_data->>'country', '')
  );

  insert into public.violation_counts (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Lock published_body once set; snapshot body on publish ----------
create or replace function public.lock_published_body()
returns trigger
language plpgsql
as $$
begin
  -- Reject any change to an already-set snapshot (NULL-safe).
  if old.is_published = true
     and new.published_body is distinct from old.published_body then
    raise exception 'published_body is immutable once set';
  end if;

  -- First publish (false -> true): take the immutable snapshot.
  if new.is_published = true and old.is_published = false then
    new.published_body := new.body;
  end if;

  -- A published reflection cannot be un-published (Phase 1 rule).
  if old.is_published = true and new.is_published = false then
    raise exception 'a published reflection cannot be unpublished';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_published_body on public.reflections;
create trigger enforce_published_body
  before update on public.reflections
  for each row execute function public.lock_published_body();

-- ---------- Keep reflections.updated_at fresh ------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists reflections_set_updated_at on public.reflections;
create trigger reflections_set_updated_at
  before update on public.reflections
  for each row execute function public.set_updated_at();

-- ---------- Gender is immutable after registration -------------------------
create or replace function public.prevent_gender_change()
returns trigger
language plpgsql
as $$
begin
  if new.gender is distinct from old.gender then
    raise exception 'gender is immutable';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_lock_gender on public.profiles;
create trigger profiles_lock_gender
  before update on public.profiles
  for each row execute function public.prevent_gender_change();
