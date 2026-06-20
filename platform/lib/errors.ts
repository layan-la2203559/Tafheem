import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Typed application error. Handlers throw these; `handleError` turns them into
 * clean JSON. Never leak raw Supabase/internal errors to the client.
 */
export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, message: string, code = "error", details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const Errors = {
  unauthorized: (msg = "Authentication required") =>
    new ApiError(401, msg, "unauthorized"),
  forbidden: (msg = "You do not have permission to perform this action") =>
    new ApiError(403, msg, "forbidden"),
  notFound: (msg = "Not found") => new ApiError(404, msg, "not_found"),
  badRequest: (msg = "Invalid request", details?: unknown) =>
    new ApiError(400, msg, "bad_request", details),
  conflict: (msg = "Conflict") => new ApiError(409, msg, "conflict"),
  rateLimited: (msg = "Too many requests. Please try again shortly.") =>
    new ApiError(429, msg, "rate_limited"),
  internal: (msg = "Something went wrong") => new ApiError(500, msg, "internal"),
};

/** Standard success envelope. */
export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}

/** Standard message-only success (e.g. register). */
export function okMessage(message: string, status = 200): NextResponse {
  return NextResponse.json({ message }, { status });
}

/**
 * Convert any thrown value into a safe JSON response.
 * - ApiError -> its status/message
 * - ZodError -> 400 with field issues
 * - anything else -> 500 generic (logged server-side, never echoed)
 */
export function handleError(err: unknown): NextResponse {
  if (err instanceof ApiError) {
    return NextResponse.json(
      { error: { message: err.message, code: err.code, details: err.details } },
      { status: err.status }
    );
  }

  // Malformed JSON body (req.json() throws a SyntaxError) → 400, not 500.
  if (err instanceof SyntaxError) {
    return NextResponse.json(
      { error: { message: "Invalid JSON body", code: "bad_request" } },
      { status: 400 }
    );
  }

  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          message: "Validation failed",
          code: "validation_error",
          details: err.flatten().fieldErrors,
        },
      },
      { status: 400 }
    );
  }

  // Unknown / unexpected: log server-side, return generic message.
  console.error("[tafheem] unhandled error:", err);
  return NextResponse.json(
    { error: { message: "Something went wrong", code: "internal" } },
    { status: 500 }
  );
}

/**
 * Map a Supabase Auth error (which has user-safe messages) to an ApiError.
 * For non-auth/DB errors prefer a generic message so internals don't leak.
 */
export function mapAuthError(err: { message?: string; status?: number } | null): ApiError {
  // Guard against empty / non-string messages (some 500s serialize to "{}").
  const raw = typeof err?.message === "string" ? err.message.trim() : "";
  const msg = raw && raw !== "{}" && raw !== "[object Object]" ? raw : "Authentication failed";

  if (/invalid login credentials/i.test(msg)) {
    return new ApiError(401, "Invalid email or password", "invalid_credentials");
  }
  if (/email not confirmed/i.test(msg)) {
    return new ApiError(403, "Please verify your email before signing in", "email_unverified");
  }
  if (/user already registered/i.test(msg)) {
    return new ApiError(409, "An account with this email already exists", "email_taken");
  }
  // Email delivery failure (e.g. misconfigured SMTP → "Error sending ... email").
  if (/sending.*email|error sending|smtp|confirmation email/i.test(msg)) {
    return new ApiError(
      502,
      "We couldn't send your verification email. Please try again shortly.",
      "email_send_failed"
    );
  }
  // Unknown 500s from the auth server: don't echo internals.
  if ((err?.status ?? 0) >= 500) {
    return new ApiError(502, "The authentication service is temporarily unavailable", "auth_unavailable");
  }
  return new ApiError(err?.status && err.status >= 400 ? err.status : 400, msg, "auth_error");
}
