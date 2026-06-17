import type { SupabaseClient } from "@supabase/supabase-js";
import type { z } from "zod";
import type { Database } from "@/lib/database.types";
import type { createReportSchema } from "@/lib/validation";
import { Errors } from "@/lib/errors";

type DB = SupabaseClient<Database>;

/**
 * Submit an anonymous report. The reporter's identity is NEVER stored — we
 * deliberately insert only the target + reason, no user_id of the reporter.
 */
export async function submitReport(
  db: DB,
  input: z.infer<typeof createReportSchema>
): Promise<{ id: string }> {
  const { data, error } = await db
    .from("reports")
    .insert({
      reported_reflection_id: input.reported_reflection_id ?? null,
      reported_user_id: input.reported_user_id ?? null,
      reason: input.reason,
      other_text: input.reason === "other" ? input.other_text ?? null : null,
      status: "pending",
    })
    .select("id")
    .single();
  if (error) throw Errors.internal("Failed to submit report");
  return { id: (data as { id: string }).id };
}
