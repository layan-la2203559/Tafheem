/**
 * Tafheem functional + security test runner (no framework — plain fetch).
 *
 *   1. start the dev server:  npm run dev
 *   2. in another terminal:   npx tsx tests/functional.test.ts
 *
 * Provisions confirmed users via the Supabase admin API (so we skip the email
 * step), assigns roles, then drives every endpoint and logs PASS/FAIL.
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

function loadEnv() {
  try {
    for (const line of readFileSync(join(process.cwd(), ".env.local"), "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
}
loadEnv();

const BASE = process.env.TEST_BASE || "http://localhost:3000";
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });

let pass = 0, fail = 0;
const rows: { name: string; ok: boolean; note: string }[] = [];
function rec(name: string, ok: boolean, note = "") {
  rows.push({ name, ok, note });
  ok ? pass++ : fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${note ? "  — " + note : ""}`);
}

interface Res { status: number; json: any }
async function call(
  path: string,
  opts: { method?: string; token?: string; body?: any; rawBody?: string } = {}
): Promise<Res> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.token) headers.Authorization = "Bearer " + opts.token;
  const res = await fetch(BASE + path, {
    method: opts.method || "GET",
    headers,
    body: opts.rawBody !== undefined ? opts.rawBody : opts.body ? JSON.stringify(opts.body) : undefined,
  });
  let json: any = null;
  try { json = await res.json(); } catch {}
  return { status: res.status, json };
}

async function makeUser(email: string, role?: "moderator" | "admin") {
  await admin.auth.admin
    .listUsers()
    .then(({ data }) => data.users.find((u) => u.email === email))
    .then((u) => u && admin.auth.admin.deleteUser(u.id));
  const { data, error } = await admin.auth.admin.createUser({
    email, password: "Passw0rd!23", email_confirm: true,
    user_metadata: { display_name: email.split("@")[0], gender: "male", country: "Malaysia" },
  });
  if (error || !data.user) throw new Error("createUser failed: " + error?.message);
  if (role) await admin.from("profiles").update({ role }).eq("id", data.user.id);
  const signin = createClient(URL, ANON, { auth: { persistSession: false } });
  const { data: s } = await signin.auth.signInWithPassword({ email, password: "Passw0rd!23" });
  return { id: data.user.id, token: s!.session!.access_token, email };
}

async function main() {
  console.log("Base:", BASE);
  const ts = Date.now();
  const alice = await makeUser(`alice_${ts}@tafheem.test`);
  const bob = await makeUser(`bob_${ts}@tafheem.test`);
  const mod = await makeUser(`mod_${ts}@tafheem.test`, "moderator");
  const adminU = await makeUser(`admin_${ts}@tafheem.test`, "admin");

  // ---------- AUTH (endpoint validation) ----------
  const regEmail = `reg_${ts}@tafheem.test`;
  let r = await call("/api/auth/register", { method: "POST", body: { display_name: "Reg", email: regEmail, password: "Passw0rd!23", gender: "male", country: "Malaysia" } });
  rec("register valid → 201", r.status === 201, `got ${r.status}`);
  r = await call("/api/auth/register", { method: "POST", body: { display_name: "Reg", email: regEmail, password: "Passw0rd!23", gender: "male", country: "Malaysia" } });
  rec("register duplicate → 409", r.status === 409, `got ${r.status}`);
  r = await call("/api/auth/register", { method: "POST", body: { email: regEmail, password: "Passw0rd!23", gender: "male", country: "X" } });
  rec("register missing display_name → 400", r.status === 400, `got ${r.status}`);
  r = await call("/api/auth/register", { method: "POST", body: { display_name: "A", email: "notanemail", password: "Passw0rd!23", gender: "male", country: "X" } });
  rec("register invalid email → 400", r.status === 400, `got ${r.status}`);
  r = await call("/api/auth/register", { method: "POST", body: { display_name: "A", email: `p_${ts}@t.test`, password: "short", gender: "male", country: "X" } });
  rec("register short password → 400", r.status === 400, `got ${r.status}`);
  r = await call("/api/auth/register", { method: "POST", body: { display_name: "A", email: `g_${ts}@t.test`, password: "Passw0rd!23", gender: "other", country: "X" } });
  rec("register invalid gender → 400", r.status === 400, `got ${r.status}`);

  r = await call("/api/auth/login", { method: "POST", body: { email: alice.email, password: "wrongpass" } });
  rec("login wrong password → 401", r.status === 401, `got ${r.status}`);

  // ---------- AUTH MIDDLEWARE ----------
  r = await call("/api/profile/me");
  rec("no token → 401", r.status === 401, `got ${r.status}`);
  r = await call("/api/profile/me", { token: alice.token.slice(0, -2) + "xx" });
  rec("tampered token → 401", r.status === 401, `got ${r.status}`);
  r = await call("/api/profile/me", { token: alice.token });
  rec("valid token → 200", r.status === 200, `got ${r.status}`);

  // ---------- INPUT VALIDATION / INJECTION ----------
  r = await call("/api/reflections", { method: "POST", token: alice.token, rawBody: "{ not json" });
  rec("malformed JSON → 400 (not 500)", r.status === 400, `got ${r.status}`);
  r = await call("/api/reflections", { method: "POST", token: alice.token, body: { surah_number: -1, ayah_number: 1, body: "x" } });
  rec("surah_number -1 → 400", r.status === 400, `got ${r.status}`);
  r = await call("/api/reflections", { method: "POST", token: alice.token, body: { surah_number: "abc", ayah_number: 1, body: "x" } });
  rec("surah_number 'abc' → 400", r.status === 400, `got ${r.status}`);
  r = await call("/api/reflections", { method: "POST", token: alice.token, body: { surah_number: 1, ayah_number: 999999, body: "x" } });
  rec("ayah_number 999999 → 400", r.status === 400, `got ${r.status}`);
  r = await call("/api/reflections", { method: "POST", token: alice.token, body: { surah_number: 1, ayah_number: 1, body: "x", tags: Array.from({ length: 1000 }, (_, i) => "t" + i) } });
  rec("1000 tags → 400", r.status === 400, `got ${r.status}`);
  r = await call("/api/reflections", { method: "POST", token: alice.token, body: { surah_number: 1, ayah_number: 1, body: "x".repeat(1_000_000) } });
  rec("1MB body → 400 (capped, not crash)", r.status === 400, `got ${r.status}`);

  // SQL injection stored as data (parameterized) — should succeed + not break DB
  r = await call("/api/reflections", { method: "POST", token: alice.token, body: { surah_number: 1, ayah_number: 1, body: "'; DROP TABLE reflections; --" } });
  rec("SQLi payload stored safely → 201", r.status === 201, `got ${r.status}`);
  const sqliId = r.json?.data?.id;
  const stillThere = await admin.from("reflections").select("id").limit(1);
  rec("reflections table intact after SQLi", !stillThere.error, stillThere.error?.message || "");

  // XSS payload sanitized
  r = await call("/api/reflections", { method: "POST", token: alice.token, body: { surah_number: 1, ayah_number: 1, body: "<script>alert(1)</script><b>ok</b><img src=x onerror=alert(1)>" } });
  const xssBody = r.json?.data?.body || "";
  rec("XSS sanitized (no <script>/onerror)", r.status === 201 && !/script|onerror/i.test(xssBody), xssBody);

  // extra unexpected field ignored (not stored)
  r = await call("/api/reflections", { method: "POST", token: alice.token, body: { surah_number: 1, ayah_number: 1, body: "hello", is_published: true, user_id: bob.id } });
  rec("extra fields ignored (is_published/user_id not honored)", r.status === 201 && r.json?.data?.is_published === false && r.json?.data?.user_id === alice.id, JSON.stringify({ pub: r.json?.data?.is_published, uid: r.json?.data?.user_id === alice.id }));

  // ---------- REFLECTION PRIVACY / AUTHZ ----------
  r = await call("/api/reflections", { method: "POST", token: alice.token, body: { surah_number: 2, ayah_number: 255, body: "alice private note", tags: ["faith"] } });
  const aliceRef = r.json?.data?.id;
  rec("create reflection → 201 private", r.status === 201 && r.json?.data?.is_published === false, `id=${aliceRef}`);

  r = await call("/api/reflections/mine", { token: alice.token });
  rec("mine shows own reflection", r.json?.data?.some((x: any) => x.id === aliceRef), "");
  r = await call("/api/reflections/mine", { token: bob.token });
  rec("mine does NOT show another user's", !(r.json?.data || []).some((x: any) => x.id === aliceRef), "");

  r = await call(`/api/reflections/${aliceRef}`, { token: bob.token });
  rec("bob GET alice private → 404", r.status === 404, `got ${r.status}`);
  r = await call(`/api/reflections/${aliceRef}`, { method: "PATCH", token: bob.token, body: { body: "hacked" } });
  rec("bob PATCH alice reflection → 404/403", r.status === 404 || r.status === 403, `got ${r.status}`);
  r = await call(`/api/reflections/${aliceRef}/publish`, { method: "POST", token: bob.token });
  rec("bob publish alice reflection → 404/403", r.status === 404 || r.status === 403, `got ${r.status}`);
  r = await call(`/api/reflections/${aliceRef}`, { method: "DELETE", token: bob.token });
  rec("bob DELETE alice reflection → 404/403", r.status === 404 || r.status === 403, `got ${r.status}`);

  r = await call("/api/reflections/public", { token: bob.token });
  rec("public feed excludes private reflection", !(r.json?.data || []).some((x: any) => x.id === aliceRef), "");

  // edit then publish
  r = await call(`/api/reflections/${aliceRef}`, { method: "PATCH", token: alice.token, body: { body: "alice EDITED note" } });
  rec("edit private body → 200", r.status === 200, `got ${r.status}`);
  r = await call(`/api/reflections/${aliceRef}/publish`, { method: "POST", token: alice.token });
  rec("publish clean reflection → 200", r.status === 200 && r.json?.data?.is_published === true, `got ${r.status}`);
  const publishedBody = r.json?.data?.published_body;
  r = await call(`/api/reflections/${aliceRef}`, { method: "PATCH", token: alice.token, body: { body: "post-publish edit" } });
  rec("edit AFTER publish → 400 (locked)", r.status === 400, `got ${r.status}`);
  r = await call(`/api/reflections/${aliceRef}/publish`, { method: "POST", token: alice.token });
  rec("double publish → 400", r.status === 400, `got ${r.status}`);
  r = await call("/api/reflections/public", { token: bob.token });
  const inFeed = (r.json?.data || []).find((x: any) => x.id === aliceRef);
  rec("published reflection appears in feed w/ display_name", !!inFeed && !!inFeed.display_name, "");
  rec("published_body is the publish-time snapshot", inFeed?.published_body === publishedBody, "");

  // raw-client tamper of published_body (as alice, via her token)
  const aliceRaw = createClient(URL, ANON, { global: { headers: { Authorization: "Bearer " + alice.token } }, auth: { persistSession: false } });
  const tamper = await aliceRaw.from("reflections").update({ published_body: "TAMPERED" }).eq("id", aliceRef);
  rec("raw tamper of published_body blocked by trigger", !!tamper.error, tamper.error?.message || "NO ERROR (BAD)");

  // ---------- AUDIT ----------
  const kw = "zztesthate";
  let kr = await call("/api/mod/keywords", { method: "POST", token: adminU.token, body: { keyword: kw } });
  rec("admin add keyword → 201", kr.status === 201, `got ${kr.status}`);
  const kwId = kr.json?.data?.id;
  kr = await call("/api/mod/keywords", { method: "POST", token: mod.token, body: { keyword: "modword" } });
  rec("moderator add keyword → 403", kr.status === 403, `got ${kr.status}`);

  async function makeAndPublish(body: string) {
    const c = await call("/api/reflections", { method: "POST", token: alice.token, body: { surah_number: 3, ayah_number: 1, body } });
    return call(`/api/reflections/${c.json?.data?.id}/publish`, { method: "POST", token: alice.token });
  }
  r = await makeAndPublish(`I ${kw} this`);
  rec("publish with flagged keyword → 400", r.status === 400, `got ${r.status}`);
  r = await makeAndPublish(`I ${kw.toUpperCase()} this`);
  rec("publish with UPPERCASE keyword → 400", r.status === 400, `got ${r.status}`);
  r = await makeAndPublish(`I zz​testhate this`);
  rec("publish with zero-width-obfuscated keyword → 400", r.status === 400, `got ${r.status}`);
  r = await makeAndPublish("a perfectly clean reflection");
  rec("publish clean reflection → 200", r.status === 200, `got ${r.status}`);
  kr = await call(`/api/mod/keywords/${kwId}`, { method: "DELETE", token: mod.token });
  rec("moderator delete keyword → 403", kr.status === 403, `got ${kr.status}`);
  kr = await call(`/api/mod/keywords/${kwId}`, { method: "DELETE", token: adminU.token });
  rec("admin delete keyword → 200", kr.status === 200, `got ${kr.status}`);

  // ---------- BOOKMARKS ----------
  r = await call("/api/bookmarks", { method: "POST", token: alice.token, body: { surah_number: 2, ayah_number: 255 } });
  rec("bookmark → 201", r.status === 201, `got ${r.status}`);
  r = await call("/api/bookmarks", { method: "POST", token: alice.token, body: { surah_number: 2, ayah_number: 255 } });
  rec("duplicate bookmark handled (201 idempotent OR 409)", r.status === 201 || r.status === 409, `got ${r.status}`);
  r = await call("/api/bookmarks", { token: alice.token });
  rec("bookmark appears in list", (r.json?.data || []).some((b: any) => b.surah_number === 2 && b.ayah_number === 255), "");
  r = await call("/api/bookmarks/2/255", { method: "DELETE", token: alice.token });
  rec("remove bookmark → 200", r.status === 200, `got ${r.status}`);
  r = await call("/api/bookmarks", { token: alice.token });
  rec("bookmark gone after delete", !(r.json?.data || []).some((b: any) => b.surah_number === 2 && b.ayah_number === 255), "");

  // ---------- PROFILE ----------
  r = await call("/api/profile/me", { method: "PATCH", token: alice.token, body: { display_name: "Alice New" } });
  rec("patch display_name → 200", r.status === 200 && r.json?.data?.display_name === "Alice New", "");
  r = await call("/api/profile/me", { method: "PATCH", token: alice.token, body: { bio: "hi there" } });
  rec("patch bio → 200", r.status === 200 && r.json?.data?.bio === "hi there", "");
  r = await call("/api/profile/me", { method: "PATCH", token: alice.token, body: { gender: "female" } });
  rec("patch gender → 400 (immutable, stripped)", r.status === 400, `got ${r.status}`);
  // raw attempt to change gender via trigger
  const gt = await aliceRaw.from("profiles").update({ gender: "female" }).eq("id", alice.id);
  rec("raw gender change blocked by trigger", !!gt.error, gt.error?.message || "NO ERROR (BAD)");
  r = await call("/api/dashboard", { token: alice.token });
  rec("dashboard has 3 sections", r.json?.data && "private_reflections" in r.json.data && "public_reflections" in r.json.data && "bookmarks" in r.json.data, "");

  // ---------- REPORTS ----------
  r = await call("/api/reports", { method: "POST", token: bob.token, body: { reported_reflection_id: aliceRef, reason: "misuse" } });
  rec("submit report → 201", r.status === 201, `got ${r.status}`);
  r = await call("/api/reports", { method: "POST", token: bob.token, body: { reason: "misuse" } });
  rec("report with both targets null → 400", r.status === 400, `got ${r.status}`);
  r = await call("/api/reports", { method: "POST", token: bob.token, body: { reported_reflection_id: aliceRef, reason: "not_a_reason" } });
  rec("report invalid reason → 400", r.status === 400, `got ${r.status}`);
  // reporter identity not stored
  const repRow = await admin.from("reports").select("*").eq("reported_reflection_id", aliceRef).limit(1).single();
  rec("report row stores NO reporter identity", repRow.data && !("reporter_id" in repRow.data) && !("user_id" in repRow.data), Object.keys(repRow.data || {}).join(","));

  // ---------- MODERATION ----------
  r = await call("/api/mod/queue?status=pending", { token: mod.token });
  rec("mod queue lists pending reports", r.status === 200 && Array.isArray(r.json?.data), `got ${r.status}`);
  r = await call("/api/mod/queue?status=pending", { token: alice.token });
  rec("regular user → mod queue 403", r.status === 403, `got ${r.status}`);
  r = await call("/api/mod/log", { token: alice.token });
  rec("regular user → mod log 403", r.status === 403, `got ${r.status}`);
  r = await call("/api/mod/keywords", { token: alice.token });
  rec("regular user → mod keywords 403", r.status === 403, `got ${r.status}`);

  // create a fresh report + action it (warn → log entry)
  const c = await call("/api/reflections", { method: "POST", token: bob.token, body: { surah_number: 5, ayah_number: 1, body: "bob reflection" } });
  await call(`/api/reflections/${c.json?.data?.id}/publish`, { method: "POST", token: bob.token });
  const rep = await call("/api/reports", { method: "POST", token: alice.token, body: { reported_reflection_id: c.json?.data?.id, reported_user_id: bob.id, reason: "harassment" } });
  const repId = rep.json?.data?.id;
  r = await call("/api/mod/action", { method: "POST", token: mod.token, body: { report_id: repId, action: "warn", target_user_id: bob.id, note: "be nice" } });
  rec("mod action warn → 200 + logged", r.status === 200 && r.json?.data?.logged === true, `got ${r.status}`);
  r = await call("/api/mod/log", { token: mod.token });
  rec("mod log contains the warn action", (r.json?.data || []).some((l: any) => l.report_id === repId && l.action === "warn"), "");

  // suspend bob, then bob is blocked everywhere
  await call("/api/mod/action", { method: "POST", token: mod.token, body: { report_id: repId, action: "suspend", target_user_id: bob.id, note: "timeout" } });
  const susp = await admin.from("profiles").select("suspended").eq("id", bob.id).single();
  rec("suspend sets profiles.suspended=true", susp.data?.suspended === true, "");
  r = await call("/api/profile/me", { token: bob.token });
  rec("suspended user blocked by requireAuth → 403", r.status === 403, `got ${r.status}`);
  r = await call("/api/reflections", { method: "POST", token: bob.token, body: { surah_number: 1, ayah_number: 1, body: "should be blocked" } });
  rec("suspended user cannot post → 403", r.status === 403, `got ${r.status}`);

  // ban bob
  await call("/api/mod/action", { method: "POST", token: mod.token, body: { report_id: repId, action: "ban", target_user_id: bob.id, note: "gone" } });
  const ban = await admin.from("profiles").select("banned").eq("id", bob.id).single();
  rec("ban sets profiles.banned=true", ban.data?.banned === true, "");

  // ---------- ERROR LEAKAGE ----------
  r = await call(`/api/reflections/not-a-uuid`, { token: alice.token });
  rec("bad UUID does not leak internals", !JSON.stringify(r.json).match(/supabase|pg_|postgres|stack|\/home\//i), JSON.stringify(r.json).slice(0, 120));

  // ---------- cleanup ----------
  for (const u of [alice, bob, mod, adminU]) await admin.auth.admin.deleteUser(u.id).catch(() => {});
  await admin.auth.admin.listUsers().then(({ data }) => {
    const u = data.users.find((x) => x.email === regEmail);
    return u && admin.auth.admin.deleteUser(u.id);
  });

  console.log(`\n=== RESULTS ===\nPASS: ${pass}\nFAIL: ${fail}\nTOTAL: ${pass + fail}`);
  if (fail > 0) {
    console.log("\nFailures:");
    rows.filter((x) => !x.ok).forEach((x) => console.log(" - " + x.name + (x.note ? " (" + x.note + ")" : "")));
  }
}

main().catch((e) => { console.error("RUNNER ERROR:", e); process.exit(1); });
