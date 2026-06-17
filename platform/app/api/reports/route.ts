import { ok, handleError } from "@/lib/errors";
import { requireAuth } from "@/lib/guards/requireAuth";
import { parse, createReportSchema } from "@/lib/validation";
import { submitReport } from "@/lib/services/report.service";

export async function POST(req: Request) {
  try {
    // Auth is required to submit, but the reporter's identity is NOT stored.
    const { supabase } = await requireAuth(req);
    const input = parse(createReportSchema, await req.json());
    const result = await submitReport(supabase, input);
    return ok(result, 201);
  } catch (err) {
    return handleError(err);
  }
}
