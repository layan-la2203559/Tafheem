# Tafheem Platform — Phase 1 MVP backend

Next.js (App Router) + Supabase backend for the Tafheem Qur'anic reflection
platform. The API is implemented as Next.js **Route Handlers** (`app/api/**`);
all business logic lives in framework-agnostic services under `lib/services/`.
The UI here is intentionally undesigned — plain HTML test pages under
`public/test/` exercise the backend. Real UI comes later from the design team.

> Lives in the `platform/` subfolder of the Tafheem repo. The existing PHP
> landing page (`../Coming_Soon_page/`) is untouched.

## Stack

| Layer | Tech |
|---|---|
| App / API | Next.js 14 Route Handlers (Node.js) + TypeScript |
| Validation | Zod (`lib/validation`) |
| Auth | Supabase Auth (email/password, JWT, email verification) |
| Database | Supabase PostgreSQL + Row-Level Security |
| Email | Resend (verification / reset) |
| Qur'an data | Quran.com API v4 → `quran_verses` (seed once) |

## Project layout

```
app/api/**            Route Handlers (thin: parse → guard → service → JSON)
lib/services/**       All business logic (portable, no Next.js coupling)
lib/guards/**         requireAuth, requireRole, runAudit, rateLimit
lib/validation/       Zod schemas
lib/supabase/         server (service-role + SSR + bearer) and browser clients
lib/errors.ts         ApiError + handleError (never leaks raw DB errors)
db/migrations/        0001_schema, 0002_rls, 0003_triggers
db/seed-quran.ts      one-off verse seeder
public/test/          no-design HTML test pages
```

## Setup

### 1. Install
```bash
cd platform
npm install
```

### 2. Environment
Copy `.env.local.example` → `.env.local` and fill from
Supabase Dashboard → Project Settings → API:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Database schema (project `wgzumfwrihavmwbaswnv`)
**Already applied** to the live project (migrations 0001–0005) and
`lib/database.types.ts` is generated from it. To reproduce on another project,
run the migrations **in order** (Supabase MCP `apply_migration` or the SQL
editor):
```
db/migrations/0001_schema.sql       tables + enums
db/migrations/0002_rls.sql          row-level security + role helpers
db/migrations/0003_triggers.sql     profile creation, immutability, updated_at
db/migrations/0004_hardening.sql    pin search_path, lock down functions
db/migrations/0005_function_grants.sql  revoke direct EXECUTE grants
```
Remaining Supabase advisor warnings are accepted by design: `reports`
INSERT is intentionally open (anonymous reporting), and `is_admin` /
`is_mod_or_admin` must be EXECUTE-able by `authenticated` because the RLS
policies call them.

### 4. Enable email auth
Supabase Dashboard → Authentication → Providers → Email → enable
**Confirm email**.

### 5. Seed Qur'an verses (once)
```bash
npm run seed:quran     # ~6,236 verses from the Quran.com API
```

### 6. Run
```bash
npm run dev            # http://localhost:3000
```
Then open the test pages, e.g. http://localhost:3000/test/register.html

## Auth model for the test pages
`login.html` stores the Supabase `access_token` in `localStorage`. Every other
page sends it as `Authorization: Bearer <token>`. Route Handlers verify it via
`requireAuth`. To test moderation, set a user's `profiles.role` to `moderator`
or `admin` in Supabase, then use `mod.html`.

## API reference (all under `/api`)

**Auth** `POST /auth/register · /auth/login · /auth/logout · /auth/forgot-password · /auth/reset-password`

**Quran** `GET /quran/surahs · /quran/surah/:num · /quran/verse/:s/:a · /quran/word/:s/:a/:pos · /quran/root/:root · /quran/similar/:s/:a`

**Reflections** `POST /reflections · GET /reflections/mine · GET|PATCH|DELETE /reflections/:id · POST /reflections/:id/publish · GET /reflections/public · GET /reflections/public/verse/:s/:a`

**Bookmarks** `POST|GET /bookmarks · DELETE /bookmarks/:s/:a`

**Profile** `GET|PATCH /profile/me · GET /dashboard · POST /onboarding/survey`

**Reports** `POST /reports` (anonymous — reporter identity never stored)

**Moderation** (role-gated) `GET /mod/queue?status= · POST /mod/action · GET /mod/log · GET /mod/users/:id · GET|POST /mod/keywords · DELETE /mod/keywords/:id`

Response envelope: `{ "data": ... }` on success, `{ "error": { message, code } }` on failure.

## Regenerate DB types
After the schema is applied, replace the placeholder `lib/database.types.ts`
with Supabase-generated types (MCP `generate_typescript_types`, or
`supabase gen types typescript --project-id wgzumfwrihavmwbaswnv`).

## Deploy (Hostinger Business — Node.js)
hPanel → Advanced → **Node.js** → create app with Application root = the built
`platform/` and start command `npm run start`. Point the platform subdomain's
**document root** at that Node app. Set the same env vars in the Node.js app
config. Hostinger's manager (Passenger) keeps the process running.

## Notes / Phase 2
Not built yet: live circles/audio, groups, gender-filtered feeds, export UI,
social login, rich-text editor (Markdown textarea for now), notifications
beyond email verification. Lexicon data (`quran_words`) needs separate seeding
+ scholar review; word endpoints return empty tabs gracefully until then.
```
