-- ============================================================================
-- Tafheem Phase 1 MVP — 0004_hardening
-- Addresses Supabase security advisor warnings:
--  * pin search_path on trigger functions (function_search_path_mutable)
--  * stop SECURITY DEFINER helpers from being publicly RPC-callable
--    (anon/authenticated_security_definer_function_executable)
-- Note: trigger functions still fire after revoking EXECUTE — trigger
-- invocation does not check the caller's EXECUTE privilege.
-- The reports_insert_any "always true" policy is INTENTIONAL (anonymous
-- reports by any authenticated user) and is left as-is by design.
-- ============================================================================

-- Pin search_path on the remaining trigger functions.
alter function public.lock_published_body()   set search_path = public;
alter function public.set_updated_at()         set search_path = public;
alter function public.prevent_gender_change()  set search_path = public;

-- handle_new_user is only invoked by the auth.users trigger — never via RPC.
revoke execute on function public.handle_new_user() from public;

-- Role helpers are used inside RLS policies (which run as `authenticated`),
-- so authenticated needs EXECUTE, but anon/public do not.
revoke execute on function public.is_admin()        from public;
revoke execute on function public.is_mod_or_admin() from public;
grant  execute on function public.is_admin()        to authenticated;
grant  execute on function public.is_mod_or_admin() to authenticated;
