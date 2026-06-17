import { ok, handleError, ApiError } from "@/lib/errors";
import { parse, loginSchema } from "@/lib/validation";
import { loginUser } from "@/lib/services/auth.service";
import {
  assertNotBlocked,
  recordFailure,
  clientIp,
} from "@/lib/guards/rateLimit";

const LOGIN_LIMIT = { key: "login", limit: 5, windowMs: 60_000 };

export async function POST(req: Request) {
  const ip = clientIp(req);
  try {
    // Block if this IP already exceeded 5 failed attempts this minute.
    assertNotBlocked(ip, LOGIN_LIMIT);

    const input = parse(loginSchema, await req.json());

    try {
      const session = await loginUser(input);
      return ok(session, 200);
    } catch (err) {
      // Count only failed credential attempts toward the limit.
      if (err instanceof ApiError && err.status === 401) {
        recordFailure(ip, LOGIN_LIMIT);
      }
      throw err;
    }
  } catch (err) {
    return handleError(err);
  }
}
