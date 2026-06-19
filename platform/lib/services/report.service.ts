import type { z } from "zod";
import type { createReportSchema } from "@/lib/validation";
import { createServiceClient } from "@/lib/supabase/server";
import { Errors } from "@/lib/errors";

/**
 * Submit an anonymous report.
 *
 * Uses the service-role client on purpose: the `reports` table only allows
 * moderators/admins to SELECT (reporter privacy), so a normal user's
 * insert-with-returning would be blocked when reading the row back. The route
 * still gates this behind requireAuth, and we deliberately store NO reporter
 * identity — only the target + reason.
 */
export async function submitReport(
  input: z.infer<typeof createReportSchema>
): Promise<{ id: string }> {
  const db = createServiceClient();
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
