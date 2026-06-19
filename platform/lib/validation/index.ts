import { z } from "zod";

/** Parse helper: throws ZodError (handled centrally) on failure. */
export function parse<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  return schema.parse(data);
}

// ---------- Auth ------------------------------------------------------------
export const registerSchema = z.object({
  display_name: z.string().trim().min(1, "Display name is required").max(60),
  email: z.string().trim().email("A valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  gender: z.enum(["male", "female"]),
  country: z.string().trim().min(1, "Country is required").max(100),
  // Language indicator — drives the Kit (ConvertKit) tag on signup.
  language: z.enum(["en", "ar"]).default("en"),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
});

export const resetPasswordSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
  password: z.string().min(8).max(72),
});

// ---------- Reflections -----------------------------------------------------
// Longest surah (Al-Baqarah) has 286 ayahs; cap the body to bound payload size.
const MAX_BODY = 50_000;

export const createReflectionSchema = z.object({
  surah_number: z.coerce.number().int().min(1).max(114),
  ayah_number: z.coerce.number().int().min(1).max(286),
  body: z.string().trim().min(1, "Reflection body is required").max(MAX_BODY),
  tags: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
});

export const updateReflectionSchema = z
  .object({
    body: z.string().trim().min(1).max(MAX_BODY).optional(),
    tags: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
  })
  .refine((v) => v.body !== undefined || v.tags !== undefined, {
    message: "Provide body and/or tags to update",
  });

// ---------- Bookmarks -------------------------------------------------------
export const createBookmarkSchema = z.object({
  surah_number: z.coerce.number().int().min(1).max(114),
  ayah_number: z.coerce.number().int().min(1).max(286),
});

// ---------- Profile ---------------------------------------------------------
export const updateProfileSchema = z
  .object({
    display_name: z.string().trim().min(1).max(60).optional(),
    bio: z.string().trim().max(500).nullable().optional(),
  })
  .refine((v) => v.display_name !== undefined || v.bio !== undefined, {
    message: "Provide display_name and/or bio to update",
  });

// ---------- Reports ---------------------------------------------------------
export const createReportSchema = z
  .object({
    reported_reflection_id: z.string().uuid().optional(),
    reported_user_id: z.string().uuid().optional(),
    reason: z.enum([
      "misuse",
      "false_info",
      "opinion_as_verdict",
      "harassment",
      "other",
    ]),
    other_text: z.string().trim().max(1000).optional(),
  })
  .refine((v) => v.reported_reflection_id || v.reported_user_id, {
    message: "A report must target a reflection or a user",
  });

// ---------- Moderation ------------------------------------------------------
export const modActionSchema = z.object({
  report_id: z.string().uuid(),
  action: z.enum(["dismiss", "remove_content", "warn", "suspend", "ban"]),
  target_user_id: z.string().uuid().optional(),
  target_reflection_id: z.string().uuid().optional(),
  note: z.string().trim().max(1000).optional(),
});

export const createKeywordSchema = z.object({
  keyword: z.string().trim().min(1).max(100),
});

// ---------- Onboarding ------------------------------------------------------
export const onboardingSchema = z.object({
  background: z.string().trim().max(500).optional(),
  primary_goal: z.string().trim().max(500).optional(),
  reflection_style: z.string().trim().max(500).optional(),
});
