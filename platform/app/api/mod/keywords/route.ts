import { ok, handleError } from "@/lib/errors";
import { requireRole } from "@/lib/guards/requireRole";
import { createServiceClient } from "@/lib/supabase/server";
import { parse, createKeywordSchema } from "@/lib/validation";
import { listKeywords, addKeyword } from "@/lib/services/moderation.service";

export async function GET(req: Request) {
  try {
    await requireRole(req, ["moderator", "admin"]);
    const db = createServiceClient();
    return ok(await listKeywords(db));
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: Request) {
  try {
    // Adding keywords is admin-only.
    const { user } = await requireRole(req, "admin");
    const input = parse(createKeywordSchema, await req.json());
    const db = createServiceClient();
    return ok(await addKeyword(db, user.id, input), 201);
  } catch (err) {
    return handleError(err);
  }
}
