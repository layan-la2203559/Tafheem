-- ============================================================================
-- Tafheem Phase 1 MVP — 0005_function_grants
-- Supabase grants EXECUTE directly to anon/authenticated on public functions,
-- so 0004's `revoke ... from public` was not enough. Revoke the direct grants.
--
--  * handle_new_user: invoked ONLY by the auth.users trigger — no role needs
--    EXECUTE (trigger invocation ignores EXECUTE grants). Revoke from both.
--  * is_admin / is_mod_or_admin: used inside RLS policies that run as
--    `authenticated`, so authenticated MUST keep EXECUTE. Revoke from anon only.
--    (The remaining "authenticated can execute" advisory is accepted: these
--    only return the caller's own role boolean.)
-- ============================================================================

revoke execute on function public.handle_new_user() from anon, authenticated;

revoke execute on function public.is_admin()        from anon;
revoke execute on function public.is_mod_or_admin() from anon;
