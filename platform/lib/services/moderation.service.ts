import type { SupabaseClient } from "@supabase/supabase-js";
import type { z } from "zod";
import type { Database } from "@/lib/database.types";
import type {
  ModerationLogEntry,
  KeywordFlag,
  Report,
} from "@/lib/types";
import type { modActionSchema, createKeywordSchema } from "@/lib/validation";
import { Errors } from "@/lib/errors";

/**
 * Moderation operates with the SERVICE-ROLE client (passed in by the route
 * after requireRole gates access). This is the one place we legitimately need
 * to act across other users' rows.
 */
type DB = SupabaseClient<Database>;

// ---------- Queue -----------------------------------------------------------
export async function getQueue(db: DB, status: "pending" | "reviewed") {
  const statuses: Database["public"]["Enums"]["report_status"][] =
    status === "pending" ? ["pending"] : ["dismissed", "actioned"];

  const { data, error } = await db
    .from("reports")
    .select(
      `id, reported_reflection_id, reported_user_id, reason, other_text, status, created_at,
       reflection:reported_reflection_id (
         id, surah_number, ayah_number, body, published_body, is_published, user_id
       ),
       reported_user:reported_user_id ( id, display_name )`
    )
    .in("status", statuses)
    .order("created_at", { ascending: status === "pending" });

  if (error) throw Errors.internal("Failed to load moderation queue");
  return data ?? [];
}

// ---------- Action ----------------------------------------------------------
export async function performAction(
  db: DB,
  moderatorId: string,
  input: z.infer<typeof modActionSchema>
): Promise<{ report: Report; logged: boolean }> {
  // Confirm the report exists.
  const { data: report, error: rErr } = await db
    .from("reports")
    .select("id, reported_reflection_id, reported_user_id, reason, other_text, status, created_at")
    .eq("id", input.report_id)
    .maybeSingle();
  if (rErr) throw Errors.internal("Failed to load report");
  if (!report) throw Errors.notFound("Report not found");

  const reflectionId =
    input.target_reflection_id ?? (report as Report).reported_reflection_id ?? null;

  // Resolve the content owner (for violation counting + suspend/ban).
  const ownerId = await resolveOwner(
    db,
    input.target_user_id ?? (report as Report).reported_user_id ?? null,
    reflectionId
  );

  // --- apply the action -----------------------------------------------------
  switch (input.action) {
    case "dismiss":
      await setReportStatus(db, input.report_id, "dismissed");
      break;

    case "remove_content": {
      if (!reflectionId) {
        throw Errors.badRequest("remove_content requires a target reflection");
      }
      const { error } = await db.from("reflections").delete().eq("id", reflectionId);
      if (error) throw Errors.internal("Failed to remove content");
      await setReportStatus(db, input.report_id, "actioned");
      await incrementViolations(db, ownerId);
      break;
    }

    case "warn":
      await setReportStatus(db, input.report_id, "actioned");
      await incrementViolations(db, ownerId);
      break;

    case "suspend":
      if (!ownerId) throw Errors.badRequest("suspend requires a target user");
      await db.from("profiles").update({ suspended: true }).eq("id", ownerId);
      await setSuspendBan(db, ownerId, { suspended: true });
      await setReportStatus(db, input.report_id, "actioned");
      await incrementViolations(db, ownerId);
      break;

    case "ban":
      if (!ownerId) throw Errors.badRequest("ban requires a target user");
      await db.from("profiles").update({ banned: true }).eq("id", ownerId);
      await setSuspendBan(db, ownerId, { banned: true });
      // Defense in depth: also disable the account at the Supabase auth layer so
      // a banned user can't mint fresh tokens (best-effort).
      await db.auth.admin
        .updateUserById(ownerId, { ban_duration: "876000h" })
        .catch((e) => console.error("[tafheem] supabase ban failed:", e));
      await setReportStatus(db, input.report_id, "actioned");
      await incrementViolations(db, ownerId);
      break;
  }

  // --- ALWAYS log before returning success ----------------------------------
  const { error: logErr } = await db.from("moderation_log").insert({
    moderator_id: moderatorId,
    action: input.action,
    target_user_id: ownerId,
    target_reflection_id: reflectionId,
    report_id: input.report_id,
    note: input.note ?? null,
  });
  if (logErr) throw Errors.internal("Failed to write moderation log");

  const { data: updated } = await db
    .from("reports")
    .select("id, reported_reflection_id, reported_user_id, reason, other_text, status, created_at")
    .eq("id", input.report_id)
    .single();

  return { report: updated as Report, logged: true };
}

// ---------- Log + history ---------------------------------------------------
export async function getLog(db: DB): Promise<ModerationLogEntry[]> {
  const { data, error } = await db
    .from("moderation_log")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw Errors.internal("Failed to load moderation log");
  return (data ?? []) as ModerationLogEntry[];
}

export async function getUserHistory(db: DB, userId: string) {
  const [profile, violations, log] = await Promise.all([
    db
      .from("profiles")
      .select("id, display_name, role, suspended, banned, created_at")
      .eq("id", userId)
      .maybeSingle(),
    db.from("violation_counts").select("*").eq("user_id", userId).maybeSingle(),
    db
      .from("moderation_log")
      .select("*")
      .eq("target_user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  if (!profile.data) throw Errors.notFound("User not found");
  return {
    profile: profile.data,
    violations: violations.data ?? {
      user_id: userId,
      valid_report_count: 0,
      suspended: false,
      banned: false,
    },
    actions: log.data ?? [],
  };
}

// ---------- Keywords --------------------------------------------------------
export async function listKeywords(db: DB): Promise<KeywordFlag[]> {
  const { data, error } = await db
    .from("keyword_flags")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw Errors.internal("Failed to load keywords");
  return (data ?? []) as KeywordFlag[];
}

export async function addKeyword(
  db: DB,
  adminId: string,
  input: z.infer<typeof createKeywordSchema>
): Promise<KeywordFlag> {
  const { data, error } = await db
    .from("keyword_flags")
    .insert({ keyword: input.keyword, added_by: adminId, active: true })
    .select("*")
    .single();
  if (error) throw Errors.internal("Failed to add keyword");
  return data as KeywordFlag;
}

export async function deleteKeyword(db: DB, id: string): Promise<void> {
  const { error } = await db.from("keyword_flags").delete().eq("id", id);
  if (error) throw Errors.internal("Failed to delete keyword");
}

// ---------- helpers ---------------------------------------------------------
async function resolveOwner(
  db: DB,
  explicitUserId: string | null,
  reflectionId: string | null
): Promise<string | null> {
  if (explicitUserId) return explicitUserId;
  if (!reflectionId) return null;
  const { data } = await db
    .from("reflections")
    .select("user_id")
    .eq("id", reflectionId)
    .maybeSingle();
  return (data as { user_id: string } | null)?.user_id ?? null;
}

async function setReportStatus(
  db: DB,
  id: string,
  status: "dismissed" | "actioned"
) {
  const { error } = await db.from("reports").update({ status }).eq("id", id);
  if (error) throw Errors.internal("Failed to update report status");
}

async function incrementViolations(db: DB, userId: string | null) {
  if (!userId) return;
  // Read-modify-write (acceptable for MVP volume). Ensure a row exists first.
  const { data } = await db
    .from("violation_counts")
    .select("valid_report_count")
    .eq("user_id", userId)
    .maybeSingle();
  const next = ((data as { valid_report_count: number } | null)?.valid_report_count ?? 0) + 1;
  const { error } = await db
    .from("violation_counts")
    .upsert(
      { user_id: userId, valid_report_count: next },
      { onConflict: "user_id" }
    );
  if (error) throw Errors.internal("Failed to update violation count");
}

async function setSuspendBan(
  db: DB,
  userId: string,
  flags: { suspended?: boolean; banned?: boolean }
) {
  await db
    .from("violation_counts")
    .upsert({ user_id: userId, ...flags }, { onConflict: "user_id" });
}
