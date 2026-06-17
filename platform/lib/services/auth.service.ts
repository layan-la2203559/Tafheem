import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { mapAuthError, Errors } from "@/lib/errors";
import type {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validation";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/**
 * Register a new user. Supabase Auth hashes the password (bcrypt) and sends the
 * verification email. The `handle_new_user` trigger creates the profile row
 * from this metadata.
 */
export async function registerUser(input: z.infer<typeof registerSchema>) {
  const admin = createServiceClient();
  const { error } = await admin.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: `${siteUrl()}/test/login.html`,
      data: {
        display_name: input.display_name,
        gender: input.gender,
        country: input.country,
      },
    },
  });
  if (error) throw mapAuthError(error);
  // Do not return a session — email must be verified first.
}

/** Sign in with email/password. Returns the session (access + refresh tokens). */
export async function loginUser(input: z.infer<typeof loginSchema>) {
  const admin = createServiceClient();
  const { data, error } = await admin.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });
  if (error) throw mapAuthError(error);
  if (!data.session) throw Errors.unauthorized("Login failed");

  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
    user: { id: data.user.id, email: data.user.email },
  };
}

/** Invalidate the caller's session. */
export async function logoutUser(accessToken: string) {
  const admin = createServiceClient();
  // Best-effort global sign-out for this user's token.
  await admin.auth.admin.signOut(accessToken).catch(() => undefined);
}

/** Send a password-reset email. Always succeeds to avoid email enumeration. */
export async function forgotPassword(input: z.infer<typeof forgotPasswordSchema>) {
  const admin = createServiceClient();
  await admin.auth
    .resetPasswordForEmail(input.email, {
      redirectTo: `${siteUrl()}/test/login.html`,
    })
    .catch(() => undefined);
}

/**
 * Complete a password reset using the recovery tokens from the email link.
 * We set the session from the provided tokens, then update the password.
 */
export async function resetPassword(input: z.infer<typeof resetPasswordSchema>) {
  // A short-lived client carrying the recovery session.
  const { createClient } = await import("@supabase/supabase-js");
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const { error: sessionError } = await client.auth.setSession({
    access_token: input.access_token,
    refresh_token: input.refresh_token,
  });
  if (sessionError) throw mapAuthError(sessionError);

  const { error } = await client.auth.updateUser({ password: input.password });
  if (error) throw mapAuthError(error);
}
