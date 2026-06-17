/**
 * Hand-written domain types mirroring the DB schema (db/migrations/0001_schema.sql).
 * Used by services for clear return shapes. Once the Supabase-generated
 * `database.types.ts` lands you can switch to `Tables<'reflections'>` etc.,
 * but these stay useful as the public API contract.
 */

export type Gender = "male" | "female";
export type Role = "user" | "moderator" | "admin";
export type Privacy = "private" | "public";
export type ReportReason =
  | "misuse"
  | "false_info"
  | "opinion_as_verdict"
  | "harassment"
  | "other";
export type ReportStatus = "pending" | "dismissed" | "actioned";
export type ModAction =
  | "dismiss"
  | "remove_content"
  | "warn"
  | "suspend"
  | "ban";

export interface Profile {
  id: string;
  display_name: string;
  gender: Gender;
  country: string;
  bio: string | null;
  role: Role;
  suspended: boolean;
  banned: boolean;
  created_at: string;
}

export interface Reflection {
  id: string;
  user_id: string;
  surah_number: number;
  ayah_number: number;
  body: string;
  privacy: Privacy;
  is_published: boolean;
  published_body: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface PublicReflection {
  id: string;
  user_id: string;
  display_name: string;
  surah_number: number;
  ayah_number: number;
  published_body: string;
  tags: string[] | null;
  created_at: string;
  is_new: boolean;
}

export interface Bookmark {
  id: string;
  user_id: string;
  surah_number: number;
  ayah_number: number;
  created_at: string;
}

export interface QuranVerse {
  surah_number: number;
  ayah_number: number;
  arabic_text: string;
  translation_en: string | null;
}

export interface QuranWord {
  id: string;
  surah_number: number;
  ayah_number: number;
  word_position: number;
  arabic_text: string;
  root: string | null;
  part_of_speech: string | null;
  morphology: unknown;
  mufradat_meaning: string | null;
  lanes_meaning: string | null;
}

export interface WordTabs {
  position: number;
  arabic_text: string | null;
  root: string | null;
  part_of_speech: string | null;
  tabs: {
    morphology: unknown | null;
    mufradat: string | null;
    lanes: string | null;
  };
}

export interface Report {
  id: string;
  reported_reflection_id: string | null;
  reported_user_id: string | null;
  reason: ReportReason;
  other_text: string | null;
  status: ReportStatus;
  created_at: string;
}

export interface ModerationLogEntry {
  id: string;
  moderator_id: string;
  action: ModAction;
  target_user_id: string | null;
  target_reflection_id: string | null;
  report_id: string | null;
  note: string | null;
  created_at: string;
}

export interface KeywordFlag {
  id: string;
  keyword: string;
  added_by: string | null;
  active: boolean;
  created_at: string;
}
