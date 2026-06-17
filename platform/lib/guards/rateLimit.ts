import { Errors } from "@/lib/errors";

/**
 * Minimal in-memory fixed-window rate limiter.
 *
 * NOTE: state is per server instance, so on horizontally-scaled / serverless
 * hosting this is best-effort, not a hard global limit. For Phase 1 (single
 * Hostinger Node app) it satisfies the "5 failed logins / min / IP" rule.
 * Swap for Upstash Redis later if multi-instance becomes the norm.
 */
interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  /** Unique key prefix, e.g. "login". */
  key: string;
  /** Max attempts within the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

/** Derive a client IP from common proxy headers (Hostinger / Vercel). */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

/**
 * Throws 429 when the caller has exceeded the limit. Call at the top of a
 * handler BEFORE doing work. Counts every call; for login, only call this on
 * the failed-attempt path if you want to count failures only — here we count
 * all attempts to the endpoint, which is simpler and safe.
 */
export function enforceRateLimit(identifier: string, opts: RateLimitOptions): void {
  const now = Date.now();
  const mapKey = `${opts.key}:${identifier}`;
  const bucket = buckets.get(mapKey);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(mapKey, { count: 1, resetAt: now + opts.windowMs });
    return;
  }

  bucket.count += 1;
  if (bucket.count > opts.limit) {
    throw Errors.rateLimited();
  }
}

/**
 * For "failures only" limiting (e.g. login): throw 429 if the identifier has
 * already exceeded the limit, WITHOUT counting this call. Call before doing
 * work, then call `recordFailure` only when the attempt fails.
 */
export function assertNotBlocked(identifier: string, opts: RateLimitOptions): void {
  const bucket = buckets.get(`${opts.key}:${identifier}`);
  if (bucket && Date.now() <= bucket.resetAt && bucket.count >= opts.limit) {
    throw Errors.rateLimited();
  }
}

/** Record one failed attempt against the identifier's window. */
export function recordFailure(identifier: string, opts: RateLimitOptions): void {
  const now = Date.now();
  const mapKey = `${opts.key}:${identifier}`;
  const bucket = buckets.get(mapKey);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(mapKey, { count: 1, resetAt: now + opts.windowMs });
    return;
  }
  bucket.count += 1;
}
