# Migration plan: Lovable/Supabase to PERN

The prototype was generated with Lovable (TanStack Start + Supabase). It talks to the
database directly from the browser and relies on Postgres row-level security (RLS). The
target is a conventional PERN stack with an Express API in between, so business rules and
ACID transactions live on the server.

## Stages

Each stage leaves the repo in a working, committable state.

| Stage | Scope | Done when |
| --- | --- | --- |
| 1 | Monorepo layout. Remove every Lovable dependency and file. Convert TanStack Start (SSR) to a Vite SPA. Supabase stays as a temporary data layer. | `npm run build` and `npm test` pass; app works against the existing Supabase project |
| 2 | `apps/api`: Express + TypeScript, Postgres via docker-compose, SQL migrations, seed (ported from the prototype), auth (argon2, JWT access token, rotating refresh token), RBAC, content and progress endpoints, integration tests on a real Postgres | API tests green; seed loads the 8 courses |
| 3 | Replace `@/integrations/supabase` in the web app with an API client. Delete the Supabase dependency and `supabase/` folder. | `grep -ri supabase` finds nothing |
| 4 | Offline PWA (service worker, IndexedDB, outbox sync with idempotency keys), self-hosted fonts, one course fully translated into a second language | Course usable in airplane mode; progress syncs on reconnect |
| Phase 2 | Server-graded assessments, certificates, facilitator cohorts, dashboards | |

## Supabase feature to PERN replacement

| Prototype | Replacement |
| --- | --- |
| `supabase.auth` (email + password) | Express auth module; phone + OTP added later |
| RLS policies, `has_role()`, `is_staff()` | Authorization middleware and service-layer checks (RLS optional as defense in depth) |
| `user_roles` enum (`learner`, `trainer`, `editor`, `admin`) | Same roles; `trainer` is renamed `facilitator` in Phase 2 |
| Storage buckets (`media`, `resources`) | Cloudinary behind an `assets` table (provider + public_id, no stored URLs) |
| `i18n_strings` table | Kept; served via an API endpoint and cached client-side |
| `lesson_progress`, `user_badges` written from the browser | Written only by the API inside a transaction |
| Content tables (`courses`, `lessons`, `quiz_questions`) | Ported, with translation tables and course versioning |
| Seeded SQL in `supabase/migrations` | Becomes the Stage 2 seed script |

## Issues found in the prototype (fix by design in Stage 2)

1. **Quiz answers are sent to the browser.** `quiz_questions.correct_index` is readable by
   anyone and the lesson page grades client-side. Grading must move to the server.
2. **Users can award themselves badges.** The `user_badges` policy lets any signed-in user
   insert any badge for their own id. Badge awarding must happen server-side.
3. **Anyone signed in can become a trainer.** `request_trainer_role()` grants the role
   immediately. Replace with a request-and-approve flow.
4. **First user to click becomes admin.** `claim_first_admin()` is first-come. Create the
   first admin from a seed script or CLI instead.
5. **Ten-year signed media URLs** (`uploadToBucket`). Store the asset id, generate URLs on demand.
6. **`.env` was committed and not git-ignored.** Fixed in Stage 1 (`.env.example` only).

## Stage 1 notes

- Removed: `@lovable.dev/*` packages, `.lovable/`, `AGENTS.md`, `bun.lock`, `bunfig.toml`,
  Lovable error reporting, the Lovable-brokered preview auth storage, the cron-secret helper,
  and the SSR server entry (`server.ts`, `start.ts`, `nitro`, Cloudflare target).
- **Google sign-in was removed.** It ran through Lovable's OAuth broker. If wanted later it
  can come back via Passport (Google OAuth) in the API.
- Page titles still come from each route's `head()`, rendered by `<HeadContent />` in the root route.
- Security headers (`X-Content-Type-Options` etc.) were a `<meta>` tag, which browsers ignore.
  They will be set properly by the server (helmet / reverse proxy).
- The router plugin regenerates `src/routeTree.gen.ts` on first run. Commit the result.
