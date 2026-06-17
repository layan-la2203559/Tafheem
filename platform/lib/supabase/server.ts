import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function assertEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Per-request SSR client wired to the Next.js cookie store. Honours RLS as the
 * signed-in user. Use this for anything that should run "as the user".
 */
export function createSsrClient() {
  const cookieStore = cookies();
  return createServerClient<Database>(
    assertEnv(SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
    assertEnv(SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component where cookies are read-only — safe to ignore.
          }
        },
      },
    }
  );
}

/**
 * Build an SSR-style client that authenticates using a bearer token taken from
 * the Authorization header (our test pages send the access_token this way).
 * Still subject to RLS as that user.
 */
export function createBearerClient(accessToken: string): SupabaseClient<Database> {
  return createClient<Database>(
    assertEnv(SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
    assertEnv(SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}

/**
 * Service-role client. BYPASSES RLS — server-only, never expose to the browser.
 * Use only where elevated access is required (seeding, moderation writes, etc.).
 */
export function createServiceClient(): SupabaseClient<Database> {
  return createClient<Database>(
    assertEnv(SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
    assertEnv(SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
