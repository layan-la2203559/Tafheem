import { createServiceClient } from "@/lib/supabase/server";

export interface AuditResult {
  flagged: boolean;
}

/**
 * Pre-post audit: check `text` against active rows in `keyword_flags`
 * (case-insensitive substring match). Used before publishing reflections.
 *
 * IMPORTANT: callers must NOT reveal which keyword matched — only the boolean.
 */
export async function runAudit(text: string): Promise<AuditResult> {
  const admin = createServiceClient();
  const { data, error } = await admin
    .from("keyword_flags")
    .select("keyword")
    .eq("active", true);

  if (error) {
    // Fail closed: if we cannot audit, do not allow publish.
    throw new Error("audit_unavailable");
  }

  const haystack = text.toLowerCase();
  const flagged = (data ?? []).some((row) => {
    const kw = String(row.keyword ?? "").trim().toLowerCase();
    return kw.length > 0 && haystack.includes(kw);
  });

  return { flagged };
}
