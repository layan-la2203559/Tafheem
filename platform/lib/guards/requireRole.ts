import type { Role } from "@/lib/types";
import { createServiceClient } from "@/lib/supabase/server";
import { Errors } from "@/lib/errors";
import { requireAuth, type AuthContext } from "./requireAuth";

export interface RoleContext extends AuthContext {
  role: Role;
}

/**
 * Require the authenticated user to hold one of `roles`.
 * Reads the role via the service client (bypasses RLS, authoritative).
 * Throws 401 if unauthenticated, 403 if the role is insufficient.
 */
export async function requireRole(
  req: Request,
  roles: Role | Role[]
): Promise<RoleContext> {
  const ctx = await requireAuth(req);
  const allowed = Array.isArray(roles) ? roles : [roles];

  const admin = createServiceClient();
  const { data, error } = await admin
    .from("profiles")
    .select("role")
    .eq("id", ctx.user.id)
    .single();

  if (error || !data) throw Errors.forbidden();
  const role = data.role as Role;
  if (!allowed.includes(role)) throw Errors.forbidden();

  return { ...ctx, role };
}
