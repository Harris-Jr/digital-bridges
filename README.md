# Digital Bridges

Inclusive digital literacy training platform for underserved communities in
Zambia. Learners work through short, plain-language courses on phone basics,
online safety, mobile money, finding work and more — on any smartphone, on slow
or intermittent connections.

## Stack (PERN)

| Layer | Technology |
| --- | --- |
| Frontend | React 19 + TanStack Router, built with Vite 7 as an **offline-first PWA** |
| Backend | Node 22 (LTS) + Express 5 REST API |
| Database | PostgreSQL 17 (vanilla; ACID, foreign keys, constraints) |
| Auth | JWT (bcrypt-hashed passwords), role-based access |
| Styling | Tailwind CSS v4 + shadcn/ui components |

Everything runs comfortably within the projected 100–50,000 users on a single
Hostinger VPS. The design is built to scale horizontally: the API is stateless
(add replicas behind a reverse proxy), Postgres is pooled (front it with
PgBouncer as load grows), and the offline-first client keeps most reads off the
server.

## Why these choices

- **PERN over MERN** — the app is transaction-heavy (quiz submissions, progress,
  enrollments, badges, consent records). PostgreSQL gives real ACID guarantees
  and referential integrity; JSONB columns cover the flexible content blocks, so
  nothing is lost versus a document database.
- **Offline-first PWA** — the primary beneficiaries are rural, low-bandwidth
  users. A service worker precaches the app shell and runtime-caches API reads
  and media, so lessons keep working with little or no connection.
- **ACID in practice** — every all-or-nothing write runs in a transaction
  (`withTransaction`). Marking a lesson complete and awarding any unlocked badges
  commit together; the progress upsert is idempotent (`ON CONFLICT DO NOTHING`)
  so a replayed offline request is safe.

## Project structure

```
digital-bridges/
├── client/              React PWA (Vite)
│   ├── src/
│   │   ├── routes/       file-based routes (TanStack Router)
│   │   ├── components/   UI + shadcn/ui
│   │   └── lib/          api client, auth, content hooks, i18n, consent
│   ├── nginx.conf        production static serving + API proxy
│   └── Dockerfile
├── server/              Express + Postgres API
│   ├── src/
│   │   ├── routes/       auth, content, learner, profile, trainer, public
│   │   ├── db.ts         pooled pg + withTransaction()
│   │   ├── migrate.ts    minimal SQL migration runner
│   │   └── middleware.ts JWT auth + role guards
│   ├── migrations/       001_schema.sql, 002_seed.sql
│   └── Dockerfile
├── docker-compose.yml    db + api + web
└── .env.example
```

## Run with Docker (simplest)

```bash
cp .env.example .env          # then edit secrets
docker compose up --build
```

The web app is served at http://localhost:8080 and proxies `/api` to the API.
Migrations run automatically on API start.

## Run locally (for development)

Requires Node 22+ and a running PostgreSQL 17.

```bash
# 1. Database
createdb digitalbridges

# 2. API
cd server
cp .env.example .env          # point DATABASE_URL at your database
npm install
npm run migrate               # create schema + seed content
npm run dev                   # http://localhost:4000

# 3. Client (second terminal)
cd client
npm install
npm run dev                   # http://localhost:5173  (proxies /api to :4000)
```

First account: sign up, then open **Settings → Make me the admin** to claim the
first admin role (only works while no admin exists).

## Scripts

Server: `npm run dev`, `npm run build`, `npm start`, `npm run migrate`, `npm run typecheck`
Client: `npm run dev`, `npm run build`, `npm run preview`, `npm test`, `npm run typecheck`

## Media

Course and lesson images are managed in the admin. With Cloudinary configured
(set `CLOUDINARY_*` in the server `.env`), staff upload images directly from the
edit dialog — the browser uploads straight to Cloudinary using a short-lived
signature from `/api/admin/media/sign`, so large files never pass through the
API. Without Cloudinary keys, uploads are disabled and admins paste an image URL
instead; nothing else changes.

Images are stored as URLs in the content tables, so they can equally come from
object storage. For offline packs, bundle low-bitrate media; stream-only
(e.g. YouTube) links are for online supplementary content.

## AI features (optional)

With a Google Gemini key (`GEMINI_API_KEY` in the server `.env`; free tier from
aistudio.google.com), two AI helpers turn on automatically:

- **Learner chatbot** — a floating "ask for help" assistant for signed-in
  learners, grounded in the platform's own courses, answering in plain language
  (EN/Bemba/Nyanja) and kept to digital-literacy help with basic safety rules.
- **Admin quiz generation** — on a lesson's quiz page, "Generate with AI" drafts
  multiple-choice questions (options, correct answer, explanation) from the
  lesson text; staff review, pick, and save them.

Both call Gemini server-side, are rate-limited by Google's free tier, and are
hidden entirely when no key is set. `GEMINI_MODEL` is overridable if Google
renames the current free Flash model.

## Data protection

The platform follows Zambia's Data Protection Act No. 3 of 2021: consent is
recorded, and learners can export or delete their data from Settings. A
meaningful share of learners are minors (15–35 target), so age confirmation is
captured at sign-up.
