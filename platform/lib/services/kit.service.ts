/**
 * Kit (ConvertKit) integration — mirrors the landing page's `save.php` flow.
 * On signup we tag the subscriber by language (`language_english` /
 * `language_arabic`) using the ConvertKit v3 API + KIT_API_SECRET.
 *
 * Best-effort: a Kit failure must NEVER block registration, so callers should
 * not await this in a way that surfaces errors to the user. All errors are
 * swallowed and logged.
 */
const KIT_BASE = "https://api.convertkit.com/v3";

function tagNameForLanguage(language: "en" | "ar"): string {
  return language === "ar" ? "language_arabic" : "language_english";
}

async function findOrCreateTag(
  apiSecret: string,
  tagName: string
): Promise<number | null> {
  // Look for an existing tag with this name.
  const listRes = await fetch(
    `${KIT_BASE}/tags?api_secret=${encodeURIComponent(apiSecret)}`
  );
  if (listRes.ok) {
    const data = (await listRes.json()) as { tags?: { id: number; name: string }[] };
    const existing = data.tags?.find((t) => t.name === tagName);
    if (existing) return existing.id;
  }

  // Create it if missing.
  const createRes = await fetch(`${KIT_BASE}/tags`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_secret: apiSecret, tag: { name: tagName } }),
  });
  if (!createRes.ok) return null;
  const created = (await createRes.json()) as { id?: number };
  return created.id ?? null;
}

/**
 * Subscribe an email to Kit with the language tag. Returns nothing and never
 * throws — failures are logged only.
 */
export async function subscribeToKit(
  email: string,
  firstName: string,
  language: "en" | "ar"
): Promise<void> {
  const apiSecret = process.env.KIT_API_SECRET;
  if (!apiSecret) return; // Kit not configured — skip silently.

  try {
    const tagId = await findOrCreateTag(apiSecret, tagNameForLanguage(language));
    if (!tagId) return;

    await fetch(`${KIT_BASE}/tags/${tagId}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_secret: apiSecret,
        email,
        first_name: firstName,
      }),
    });
  } catch (err) {
    console.error("[tafheem] Kit subscribe failed (non-fatal):", err);
  }
}
