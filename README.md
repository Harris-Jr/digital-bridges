# Digital Bridges

Free, practical digital-literacy training for communities in Zambia: phones, mobile money,
online safety, misinformation and work skills. Offline-friendly, multilingual (English,
Bemba, Nyanja), built for low bandwidth and shared devices.

## Stack

| Layer | Technology |
| --- | --- |
| Web | React 19, TypeScript, Vite, TanStack Router + Query, Tailwind v4, shadcn/ui |
| API (Stage 2) | Node.js, Express, TypeScript |
| Database (Stage 2) | PostgreSQL (ACID source of truth) |
| Media | Cloudinary behind an `assets` abstraction (swappable) |

## Repository layout

```
apps/
  web/        React SPA (this is where the UI lives today)
  api/        Express API (added in Stage 2)
docs/
  MIGRATION.md   staged plan, Supabase to PERN mapping, known issues
```

## Getting started

Requires Node 22.12+ (`nvm use`).

```sh
npm install
cp apps/web/.env.example apps/web/.env   # fill in the temporary Supabase values
npm run dev                              # http://localhost:5173
```

Other scripts: `npm run build`, `npm run typecheck`, `npm run lint`, `npm test`.

## Roadmap

See [docs/MIGRATION.md](docs/MIGRATION.md).

- [x] Stage 1: monorepo, remove Lovable, convert to a Vite SPA
- [ ] Stage 2: Express API + PostgreSQL schema, migrations, seed, auth
- [ ] Stage 3: switch the web app from Supabase to the API
- [ ] Stage 4: offline PWA and one course in two languages
- [ ] Phase 2: assessments, certificates, facilitator cohorts, dashboards
