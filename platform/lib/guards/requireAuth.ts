import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { createBearerClient } from "@/lib/supabase/server";
import { Errors } from "@/lib/errors";

export interface AuthContext {
  user: User;
  token: string;
  /** Supabase client scoped to this user (RLS applies as them). */
  supabase: SupabaseClient<Database>;
}

function extractBearer(req: Request): string | null {
  const header = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token.trim();
}

/**
 * Verify the Supabase access token from the Authorization header.
 * Throws 401 if missing/invalid. Returns the user + a user-scoped client.
 */
export async function requireAuth(req: Request): Promise<AuthContext> {
  const token = extractBearer(req);
  if (!token) throw Errors.unauthorized("Missing bearer token");

  const supabase = createBearerClient(token);
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    throw Errors.unauthorized("Invalid or expired session");
  }

  return { user: data.user, token, supabase };
}
