# Civic Wise
### Free Digital Skills and Civic Education for Zambia

A free, offline-first, multilingual learning platform that helps people in underserved communities across Zambia use their phones safely and take part in civic life.

**Live site:** https://civicwise.online
**Repository:** https://github.com/Harris-Jr/digital-bridges
**Built by:** [Zambia Cyber Security Foundation](https://zcsi-foundation.org) initiative

> The project started under the working name **Digital Bridges**. The repository, some database defaults (`digitalbridges`) and the Cloudinary folder still use that name. Everything users see says **Civic Wise**.

---

## Contents

1. [Overview](#overview)
2. [Role Structure](#role-structure)
3. [Features](#features)
4. [Tech Stack](#tech-stack)
5. [Course Content](#course-content)
6. [Page Builder](#page-builder)
7. [Multilingual, Offline and AI](#multilingual-offline-and-ai)
8. [Database Schema](#database-schema)
9. [API Overview](#api-overview)
10. [Key Flows](#key-flows)
11. [Branches, CI and Deployment Pipeline](#branches-ci-and-deployment-pipeline)
12. [Key Technical Notes](#key-technical-notes)
13. [Local Development](#local-development)
14. [Database Setup (Step by Step)](#database-setup-step-by-step)
15. [Server Setup on the VPS (Step by Step)](#server-setup-on-the-vps-step-by-step)
16. [Environment Variables Checklist](#environment-variables-checklist)
17. [Project Structure](#project-structure)
18. [Ownership Transfer Guide](#ownership-transfer-guide)
19. [Fresh Rebuild Guide](#fresh-rebuild-guide)
20. [Login Portals](#login-portals)

---

## Overview

Civic Wise is a Progressive Web App (PWA) that teaches practical digital and civic skills in plain language, on any handset, with as little data as possible. It has two learning pathways (Digital Skills and Civic Education), courses split into modules of short lessons with check quizzes, shareable badges and verifiable certificates, trainer tools for running community groups, and a staff admin with a page builder, news, a media library and AI writing help.

Three things shape every decision in this codebase:

1. **Reach over polish.** It must work on old Android phones, on slow networks and offline. Pages are light, media is optional, videos load only when tapped, and whole courses can be saved for offline use.
2. **Language.** The interface and the course catalogue are available in English, Bemba and Nyanja, with a translation layer that falls back to English for anything not yet translated.
3. **Graceful degradation.** Every optional integration (AI, email, media uploads) switches itself off cleanly when its keys are not set, so the core app always runs.

> **Translations:** the Bemba and Nyanja text in the seed data is a first pass and should be reviewed by native speakers. Staff can edit any translation in Admin, Translations.

---

## Role Structure

| Role | How it is granted | What they see |
|------|-------------------|---------------|
| `learner` | Default on sign up | My learning, courses, lessons, quizzes, badges, certificates, offline packs, settings |
| `trainer` | Self-service: a signed-in user turns on trainer tools from For Trainers | Everything a learner has, plus trainer tools: community groups with join codes, sessions and attendance, materials, workshop requests |
| `editor` | Granted in the database by an admin (see [Login Portals](#login-portals)) | **Admin only.** The full content admin |
| `admin` | `npm run set-admin -- <email>` on the server | **Admin only.** Everything an editor has, plus workshop approvals and platform settings |

Roles live in the `user_roles` table (`app_role` enum). A user can hold several.

**Staff accounts are admin-only.** An account with `admin` or `editor` lands on `/admin` after sign in and is redirected away from the learner area. The one learner page staff keep is Settings (name, password, language). On public pages staff see the site the way visitors do.

The UI hides what a role cannot use, but the real boundary is the API: every `/api/admin/*` route checks the role on the server.

---

## Features

### For Learners
- **Two pathways:** Digital Skills and Civic Education.
- **Courses in modules:** 3 to 5 modules per course, 3 to 6 short lessons per module, a check quiz at the end of each module and a pass mark per course.
- **Lesson player:** outline sidebar (drawer on mobile), key points, "try it" actions, optional image, audio and YouTube video.
- **Lesson types:** read, quiz, practice and interactive scenario (choose an option, get feedback).
- **Plain language with Zambian context:** Airtel, MTN and Zamtel money, NRC, PACRA, councils, the Access to Information Act.
- **Progress:** resume where you left off, per-course progress, a day streak.
- **Badges:** earned automatically, shareable to WhatsApp, Facebook, X and LinkedIn, or as an image.
- **Certificates:** issued on course completion, printable, with a public verification page.
- **My courses and Explore tabs** on the courses page when signed in.
- **Offline packs:** download a whole course (lessons, quizzes, scenarios, media) in the current language.
- **Three languages:** English, Bemba and Nyanja, switchable anywhere.
- **Help assistant:** an optional AI chat scoped to digital-literacy help.
- **Installable PWA:** add to home screen, opens like an app.

### For Trainers
- **Community groups (cohorts):** create a group, share its join code, choose which courses it follows, see each member's progress.
- **Sessions and attendance:** plan sessions and mark who came.
- **Trainer materials:** facilitator guides and handouts (PDFs) to download.
- **Workshop requests:** ask to run a community workshop; staff approve or decline, with an email.

### For Staff (Editors and Admins)
- **Course builder (NetAcad-style):** modules and lessons in one screen, drag-free reordering, move lessons between modules, length guidance per lesson.
- **Lesson editor:** live preview, formatting toolbar, images and links, quiz editor with explanations.
- **AI writing help:** draft a lesson, simplify it, shorten it, add local examples, or draft quiz questions from the lesson text.
- **Page builder:** edit Home, About, For Trainers and the policy pages section by section; make new pages with their own address and menu link. See [Page Builder](#page-builder).
- **News:** posts with cover images, tags, drafts and publishing; a public News page that appears once the first post is live.
- **Media library:** every upload in one place, reusable anywhere through "Choose from library".
- **Translations editor:** fill in Bemba and Nyanja for any course, lesson, quiz or page field.
- **Community groups overview, trainer materials, workshops, testimonials, partners, FAQs and the logo.**
- **Grouped, collapsible admin menu** (Learning, People, Website, Files and brand) that works on phones.

### Public (no login)
- Home, Courses, course pages, About, For Trainers, News, custom pages, Contact, Privacy, Terms, Accessibility.
- Badge and certificate verification pages (`/verify/badge/...`, `/verify/certificate/...`).
- The help assistant, when an AI key is set.

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| TanStack Router | File-based routing (`client/src/routes`). `routeTree.gen.ts` is generated by the build and committed |
| TanStack Query | Server data, caching and refetching |
| Vite 7 + vite-plugin-pwa (Workbox) | Build, dev server, service worker and offline caching |
| Tailwind CSS v4 + shadcn/ui (Radix) | Styling and accessible components |
| lucide-react | Icons |
| Zod | Validation |
| Self-hosted fonts | Latin `woff2` files in `client/src/assets/fonts` (no Google Fonts requests) |

### Backend
| Technology | Purpose |
|------------|---------|
| Node 20 | Runtime (local, CI and VPS) |
| Express 5 | HTTP API |
| node-postgres (`pg`) | PostgreSQL access through a pool |
| jsonwebtoken + bcryptjs | Short-lived access tokens, refresh tokens in an HttpOnly cookie, password hashing |
| Zod | Request validation and environment parsing |
| nodemailer | Email (optional) |
| helmet + cors | Security headers and CORS |
| Vitest | Unit tests (server and client) |

### Infrastructure
| Service | Purpose |
|---------|---------|
| PostgreSQL 16 | Database |
| Hostinger VPS | Production host: nginx, the Node API under PM2, PostgreSQL |
| nginx | Serves the built site, proxies `/api` and `/sitemap.xml` to Node, sets security headers and CSP |
| Certbot | HTTPS certificates |
| GitHub Actions | CI on every pull request; automatic deploy when `main` changes |
| Cloudinary | Image, audio, video and document hosting (optional) |
| Google Gemini + Groq | AI providers (optional; Gemini first, Groq as fallback) |
| SMTP (any provider) | Welcome, password reset, verification and workshop emails (optional) |

---

## Course Content

All course content (pathways, categories, badges, courses, modules, lessons, quizzes, scenarios) lives as JSON in `server/content/`, versioned in git. Nothing learners read is hardcoded in the app.

```bash
cd server
npm run seed -- --check                  # validate files and print a length report, no database changes
npm run seed -- --new                    # add only what is missing; existing courses untouched (deploys run this)
npm run seed                             # load everything, overwriting existing courses from the files
npm run seed -- <course-slug>            # load (overwrite) one course
npm run seed -- --prune                  # also delete lessons no longer in a file
npm run content:export -- <course-slug>  # copy admin edits back into the JSON file
```

- Seeding keeps learner progress, certificates and badges. Lessons removed from a file are unpublished, not deleted, unless `--prune` is given.
- **A full `npm run seed` overwrites admin edits to those courses.** Export first if editors changed a course in the admin. Deploys only run `--new`, so they never overwrite.
- When English text changes, the Bemba and Nyanja translation of that field is removed (English shows until it is translated again).
- **Beginner standard:** 3 to 5 modules per course, 3 to 6 lessons per module, 150 to 300 words per lesson, a 3 to 5 question check quiz ending each module, Zambian examples, no invented figures or prices.

---

## Page Builder

Every site page is a **hero** (small heading, title, intro, photo) plus an ordered list of **blocks**, stored in `site_pages.blocks` (jsonb). Admins edit them in Admin, Site pages, with a live preview.

| Block | Type key | What it shows |
|-------|----------|---------------|
| Text | `text` | Heading and formatted text, beside or above, optional divider |
| Image and text | `image_text` | Photo beside text with an optional button |
| Features | `features` | Icon grid as cards or a plain list |
| Steps | `steps` | Numbered steps with a scroll animation |
| Call to action | `cta` | Banner with one or two buttons |
| Gallery | `gallery` | Photo grid with captions |
| Video | `video` | YouTube, loaded only when tapped (privacy-enhanced domain) |
| Pathways, Live numbers, Courses, Testimonials, FAQs, Partners, Latest news, Highlights strip | `pathways`, `stats`, `courses`, `testimonials`, `faqs`, `partners`, `news`, `feature_strip` | Live sections filled from the database |

- Block definitions (editor fields, defaults, renderer) live in one file: `client/src/components/blocks.tsx`. To add a block type, add one entry there.
- Built-in pages (`is_system = true`) cannot be deleted. Custom pages live at `/p/<address>` and can appear in the menu and footer through their menu label.
- Text fields that came from the original pages carry interface translation keys (`data.t`), so they show in Bemba and Nyanja until an editor changes them.
- Privacy, Terms and Accessibility use a simple list of heading-and-paragraph sections (`body.sections`).

---

## Multilingual, Offline and AI

### Languages
- **Interface strings** live in `i18n_strings` keyed by `(key, lang)`. `t(key, fallback)` resolves the current language, then English, then the fallback in code. Languages: `en`, `bem`, `nya`.
- **Content** (courses, lessons, quizzes, scenarios, categories, pathways) is translated through the `content_translations` overlay keyed by `(entity_type, entity_id, lang, field)`. English rows are the source of truth; missing translations fall back to English.
- Content endpoints take `?lang=bem|nya` and overlay translations when reading. The client keys its cache by language.

### Offline
- Two service-worker caches: `db-api` (network first for `/api` GETs) and `db-media` (cache first for images, audio and video).
- Downloading a course fetches its detail, every lesson's quiz and scenario, and all media, in the current language.
- Lesson completions made offline are queued and replayed when the connection returns. The server write is idempotent, so replays are safe.

### AI
- **Help assistant:** open to everyone, Gemini first and Groq as fallback, per-IP rate limits, a tightly scoped system prompt (digital-literacy help only, never asks for PINs or passwords). Without keys the UI shows a plain "Get help" link.
- **Admin helpers:** lesson writing (draft, simplify, shorten, add examples) and quiz drafting from lesson text, through the same provider chain.

---

## Database Schema

Migrations live in `server/migrations/` and run in filename order. The runner wraps each file in a transaction and records it in `schema_migrations`.

### Learning content
| Table | Key columns | Purpose |
|-------|-------------|---------|
| `pathways` | slug, title, subtitle, icon_name, accent, sort_order | Digital Skills and Civic Education |
| `categories` | slug, name, icon_name | Course topics |
| `courses` | slug, title, tagline, description, outcomes, difficulty, estimated_hours, pathway_id, category_id, pass_mark, is_published | Courses |
| `modules` | course_id, title, summary, sort_order | Course sections |
| `lessons` | course_id, module_id, slug, title, type, body_richtext, key_points, try_it_action, image_url, audio_url, video_url, est_minutes, sort_order | Lessons. `sort_order` is `(module index + 1) * 1000 + lesson index` |
| `quiz_questions` | lesson_id, question, options, correct_index, explanation | Quiz questions |
| `scenario_steps` | lesson_id, prompt, options, feedback, best_index | Scenario lessons |
| `content_translations` | entity_type, entity_id, lang, field, value | Bemba and Nyanja overlays |
| `i18n_strings` | key, lang, value | Interface text |

### Learners and progress
| Table | Key columns | Purpose |
|-------|-------------|---------|
| `users` | email, password_hash, email_verified | Accounts |
| `profiles` | full_name, phone, district, language_pref, anonymized | Profile |
| `user_roles` | user_id, role | Roles (`learner`, `trainer`, `editor`, `admin`) |
| `lesson_progress` | user_id, lesson_id, completed_at | Completion (natural key, idempotent) |
| `quiz_attempts` | user_id, lesson_id, score, total | Quiz results |
| `badges` / `user_badges` | criteria; share_id, is_public | Badges and sharing |
| `certificates` | user_id, course_id, issued_at, is_public | Certificates and public verification |
| `refresh_tokens` | token_hash, expires_at, revoked_at | Revocable sessions |
| `password_reset_tokens` / `email_verification_tokens` | token_hash, expires_at, used_at | Single-use tokens (hash only) |

### Trainers and community
| Table | Key columns | Purpose |
|-------|-------------|---------|
| `community_groups` | name, location, trainer_id, join_code, course_ids | Trainer-led groups (cohorts) |
| `cohort_members` | group_id, user_id | Group membership |
| `cohort_sessions` / `attendance` | session_date; present | Sessions and attendance |
| `workshop_requests` | trainer_id, topic, date, venue, status | Workshop approvals |
| `resources` | title, type, file_url, audience, description, sort_order | Trainer materials |

### Website and media
| Table | Key columns | Purpose |
|-------|-------------|---------|
| `site_pages` | slug, hero_*, blocks, body, nav_label, is_system, is_published | Page builder pages |
| `posts` | slug, title, excerpt, body, cover_url, tags, status, published_at | News |
| `media` | url, public_id, kind, name, alt, bytes | Media library (Cloudinary) |
| `site_settings` | key, value | Logo, policy version and other settings |
| `testimonials` / `partners` / `faqs` / `stats` | | Home page content |

### Compliance
| Table | Purpose |
|-------|---------|
| `consent_records` | Cookie, terms and newsletter consent with version |
| `data_requests` | Export and deletion requests (Data Protection Act No. 3 of 2021) |
| `newsletter_subscribers` | Newsletter opt-ins |
| `contact_messages` | Contact form |

---

## API Overview

All routes are under `/api`. Public content returns published rows only.

| Group | Base path | Who | Purpose |
|-------|-----------|-----|---------|
| Auth | `/api/auth` | public | signup, login, refresh, logout, me, password reset, email verification, request trainer tools |
| Content | `/api` | public | pathways, courses, lessons, quizzes, scenarios, pages, posts, settings, i18n (all take `?lang=`) |
| Public | `/api` | public | contact, newsletter, consent, badge and certificate verification |
| Profile | `/api/profile` | signed in | name, phone, district, language, data requests |
| Learner | `/api/me` | signed in | progress, badges, certificates, sharing, join a group |
| Trainer | `/api/trainer` | trainer | groups, sessions, attendance, materials, workshop requests |
| Assistant | `/api/assistant` | public | help chat (rate limited) |
| Admin | `/api/admin` | staff | all content, curriculum, pages, posts, groups, workshops, settings |
| Admin AI | `/api/admin/ai` | staff | lesson writing, quiz drafting |
| Admin translations | `/api/admin/translations` | staff | translation editor |
| Media | `/api/admin/media` | staff | signed Cloudinary uploads and the media library |
| Health | `/api/health` | public | used by CI, the deploy script and monitoring |
| Sitemap | `/sitemap.xml` | public | every published course, post and custom page |

---

## Key Flows

### Sign up and sign in
1. A visitor signs up at `/signup` (name, email, password, consent).
2. The API creates `users`, `profiles` and a `learner` role, then returns a 15-minute access token and sets a refresh cookie.
3. The client refreshes the access token automatically before it expires.
4. After sign in, learners land on **My learning** (`/dashboard`) and staff land on **Admin** (`/admin`).
5. Signing out clears every cached query and signs out other open tabs too.

### Learning a course
1. Learner opens a course, starts or continues the next lesson.
2. Completing a lesson writes `lesson_progress` (queued if offline).
3. Badges are awarded when their criteria are met.
4. When every lesson is done and module quizzes meet the pass mark, a certificate is issued.
5. Badges and certificates can be shared; the link opens a public verification page.

### Trainer groups
1. A signed-in user turns on trainer tools from For Trainers.
2. The trainer creates a group, picks its courses and shares the join code.
3. Learners join with the code from My learning.
4. The trainer sees members' progress, plans sessions and records attendance.

### Changing course content
1. Small edits: in Admin, Courses (live immediately).
2. Larger or new courses: edit the JSON in `server/content/courses/`, check with `npm run seed -- --check`, open a pull request.
3. On deploy, `npm run seed -- --new` adds new courses only.
4. To push file changes over an existing course on purpose, run `npm run seed -- <slug>` on the server.

### Editing a page
1. Admin, Site pages, choose a page.
2. Edit the hero, add or reorder sections, watch the preview, Save.
3. Changes are live immediately. Unpublishing a custom page hides it from visitors and the menu.

---

## Branches, CI and Deployment Pipeline

```
feature/...  -> pull request into develop -> CI -> merge
develop      -> pull request into main    -> CI -> merge -> Deploy workflow -> civicwise.online
```

| Branch | Purpose |
|--------|---------|
| `main` | What is live. Protected: changes only through pull requests that pass CI. Every merge deploys |
| `develop` | The next release |
| `feature/*`, `fix/*`, `content/*` | One piece of work each |

**CI** (`.github/workflows/ci.yml`) runs on every pull request and every push to `develop`:

| Job | Steps |
|-----|-------|
| Server | install, typecheck, unit tests, build, apply all migrations to a fresh Postgres 16, validate course files, seed everything twice, run the deploy-style `--new` seed, start the API and call `/api/health` |
| Client | install, unit tests, typecheck and production build with prerendering, check `routeTree.gen.ts` is committed, keep the built site as a downloadable artifact |

**Deploy** (`.github/workflows/deploy.yml`) runs when `main` changes, or by hand from the Actions tab. It runs CI again, then connects to the VPS over SSH and runs `deploy/deploy.sh <commit>`, which:

1. fetches and checks out that exact commit in `/var/www/civicwise/app`
2. installs and builds the API
3. runs migrations, then `seed -- --new`
4. installs and builds the web app
5. copies the built site to `/var/www/civicwise/web` (old hashed assets are kept for 30 days so open tabs keep working)
6. reloads the API under PM2 and checks `/api/health`

The deploy job is switched off until the repository variable `DEPLOY_ENABLED` is `true`. Day-to-day instructions are in [CONTRIBUTING.md](CONTRIBUTING.md).

### GitHub settings this pipeline expects
| Where | Setting |
|-------|---------|
| Settings, Branches | Rule for `main`: require a pull request, require status checks `Server (API)` and `Client (web app)` |
| Settings, Secrets and variables, Actions, Secrets | `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_KNOWN_HOSTS` |
| Settings, Secrets and variables, Actions, Variables | `DEPLOY_ENABLED=true`, optional `VPS_PORT` |
| Settings, Environments | `production` (optionally require approval before each deploy) |

---

## Key Technical Notes

- **Migrations** are wrapped in a transaction by the runner; SQL files must not contain `begin` or `commit`. Never edit an applied migration; add a new numbered file.
- **Boolean env parsing** is explicit because `z.coerce.boolean()` treats `"false"` as true (this once broke STARTTLS on port 587).
- **Content overlay** also applies to nested data: a course's category and lessons are translated with it.
- **Rich text format** (lessons, news, text blocks): blank line between paragraphs, `## ` headings, `- ` and `1. ` lists, `**bold**`, `*italic*`, `[text](url)` (safe URLs only), and `![alt](url)` image lines. Write `\*` for a literal asterisk, for example `\*707#`. Tables are not supported.
- **Route nesting:** with flat route files, `x.tsx` plus `x.$id.tsx` makes the second a child of the first, so the first must render `<Outlet />`. This project uses `x.index.tsx` for list pages to avoid that.
- **`$` in file names** marks a URL parameter (`courses.$slug.tsx` is `/courses/:slug`). Quote these names in the shell.
- **Build chunks:** third-party code is split into `react`, `tanstack`, `radix`, `icons`, `zod` and `vendor` chunks (see `client/vite.config.ts`) so returning visitors keep them cached across releases.
- **Content Security Policy** is set in nginx. Adding a new outside provider (images, video, analytics) means adding it to the CSP in `deploy/nginx/civicwise.online.conf`.
- **Service worker caches** are keyed by full URL including `?lang=`, so each language is cached separately.
- **Cloudinary resource types:** images use `image`, documents use `raw` (so PDFs download as files), audio and video use `video`. Deleting from the media library also deletes from Cloudinary.

---

## Local Development

Requires Node 20 and PostgreSQL.

```bash
# 1. Clone
git clone https://github.com/Harris-Jr/digital-bridges.git
cd digital-bridges

# 2. API
cd server
npm install
cp .env.example .env          # set DATABASE_URL and JWT_SECRET
createdb civicwise            # or create the database another way
npm run migrate
npm run seed
npm run dev                   # http://localhost:4000

# 3. Web app (new terminal)
cd client
npm install
npm run dev                   # http://localhost:5173 (proxies /api to :4000)
```

Make yourself an admin (sign up in the app first):

```bash
cd server
npm run set-admin -- your@email.com
```

### Scripts
| Folder | Script | Purpose |
|--------|--------|---------|
| server | `npm run dev` | API with reload |
| server | `npm run build` / `npm start` | Compile to `dist/` / run it |
| server | `npm run typecheck` / `npm test` | Checks |
| server | `npm run migrate` | Apply pending migrations |
| server | `npm run seed` (see [Course Content](#course-content)) | Load content |
| server | `npm run content:export -- <slug>` | Database to JSON |
| server | `npm run set-admin -- <email> [--revoke]` | Grant or remove admin |
| client | `npm run dev` | Dev server |
| client | `npm run build` | Typecheck, build, prerender public pages |
| client | `npm test` | Unit tests |

---

## Database Setup (Step by Step)

### Step 1: Create the database and user

```bash
sudo -u postgres psql
```

```sql
create user civicwise with password 'a-long-random-password';
create database civicwise owner civicwise;
\q
```

### Step 2: Point the API at it

In `server/.env`:

```
DATABASE_URL=postgresql://civicwise:a-long-random-password@localhost:5432/civicwise
```

### Step 3: Apply migrations

```bash
cd server
npm run migrate
```

| Migrations | What they create |
|------------|------------------|
| `001` to `010` | Core schema: users, roles, content, progress, quizzes, scenarios, trainers, site content |
| `011` to `025` | Translations overlay, i18n strings, compliance tables, refresh tokens, home copy, email verification |
| `026_credential_sharing` | Badge share ids, public certificates |
| `027_modules` | Modules, lesson minutes, course pass mark, `lessons.updated_at` |
| `028_trainer_materials_cohorts` | Trainer materials fields, group courses |
| `029_media_library_and_news` | `media` and `posts` |
| `030_page_builder` | Page hero fields, blocks, menu labels, built-in page flags |

### Step 4: Load content

```bash
npm run seed -- --check
npm run seed
```

### Step 5: Create the first admin

Sign up on the site with the admin's email, then:

```bash
npm run set-admin -- admin@example.org
```

### Step 6: Back up

```bash
pg_dump -Fc civicwise > civicwise-$(date +%F).dump
```

Restore with `pg_restore -d civicwise --clean civicwise-YYYY-MM-DD.dump`.

---

## Server Setup on the VPS (Step by Step)

One-time setup. After this, deploys are automatic.

### Step 1: Packages

```bash
sudo apt update
sudo apt install -y nginx postgresql git rsync certbot python3-certbot-nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### Step 2: A deploy user and folders

```bash
sudo adduser --disabled-password --gecos "" deploy
sudo mkdir -p /var/www/civicwise
sudo chown deploy:deploy /var/www/civicwise
```

### Step 3: Clone the repository as the deploy user

```bash
sudo -iu deploy
git clone https://github.com/Harris-Jr/digital-bridges.git /var/www/civicwise/app
```

For a private repository, create an SSH key for `deploy` (`ssh-keygen -t ed25519`), add the public key in GitHub under the repo's Settings, Deploy keys (read only), and clone with the `git@github.com:` address.

### Step 4: Database and production settings

Create the database as in [Database Setup](#database-setup-step-by-step), then create the settings file:

```bash
nano /var/www/civicwise/app/server/.env
```

Fill it using the [checklist](#environment-variables-checklist), with `NODE_ENV=production`, `APP_URL=https://civicwise.online` and `CORS_ORIGIN=https://civicwise.online`.

### Step 5: nginx and HTTPS

```bash
sudo nano /etc/nginx/sites-available/civicwise.online.conf
```

Paste the contents of `deploy/nginx/civicwise.online.conf`, save, then:

```bash
sudo ln -s /etc/nginx/sites-available/civicwise.online.conf /etc/nginx/sites-enabled/civicwise.online.conf
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d civicwise.online -d www.civicwise.online
```

Certbot adds the SSL lines and the HTTP to HTTPS redirect to the file and keeps the security headers, CSP, caching and API proxy.

### Step 6: Let GitHub deploy

1. On your own machine: `ssh-keygen -t ed25519 -f civicwise_deploy -N ""`.
2. On the VPS, add `civicwise_deploy.pub` to `/home/deploy/.ssh/authorized_keys`.
3. On your machine: `ssh-keyscan <vps-ip>` and copy the output.
4. In GitHub, add the secrets `VPS_HOST`, `VPS_USER` (`deploy`), `VPS_SSH_KEY` (the private key file contents) and `VPS_KNOWN_HOSTS` (the keyscan output), and the variable `DEPLOY_ENABLED=true`.
5. Actions, Deploy, **Run workflow** on `main`. GitHub builds the web app, uploads it and runs `deploy/deploy.sh` on the server.

### Step 7: Start the API on boot

After the first deploy has started the API under PM2:

```bash
sudo env PATH=$PATH pm2 startup systemd -u deploy --hp /home/deploy
sudo -iu deploy pm2 save
```

> The web app is built on GitHub, not on the server, because building it needs more than 1 GB of memory. Running `deploy/deploy.sh` by hand without a folder argument builds it on the server instead.

---

## Environment Variables Checklist

`server/.env` (never committed). Only the first two are required; everything else is optional and switches off cleanly when blank.

| Variable | Required | Production value / default | Purpose |
|----------|----------|----------------------------|---------|
| `DATABASE_URL` | yes | `postgresql://civicwise:...@localhost:5432/civicwise` | Database |
| `JWT_SECRET` | yes | 32+ random characters (`openssl rand -hex 32`) | Signs tokens |
| `NODE_ENV` | prod | `production` | Mode |
| `PORT` | no | `4000` | API port (nginx and PM2 expect 4000) |
| `APP_URL` | prod | `https://civicwise.online` | Links in emails |
| `CORS_ORIGIN` | prod | `https://civicwise.online` | Allowed browser origin(s), comma separated |
| `ACCESS_TOKEN_TTL` | no | `15m` | Access token lifetime |
| `REFRESH_TOKEN_TTL_DAYS` | no | `30` | Sign-in lasts this long without activity |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | no | key / `gemini-flash-latest` | AI, primary |
| `GROQ_API_KEY` / `GROQ_MODEL` | no | key / `openai/gpt-oss-20b` | AI, fallback |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | no | | Uploads and media library |
| `CLOUDINARY_FOLDER` | no | `digital-bridges` | Upload folder |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | no | e.g. `smtp.hostinger.com` | Email |
| `SMTP_PORT` / `SMTP_SECURE` | no | `465` + `true`, or `587` + `false` | Email transport |
| `SMTP_FROM` | no | `Civic Wise <no-reply@civicwise.online>` | From header |

The web app needs no environment variables: in production nginx serves it and the API from the same domain.

**GitHub Actions secrets and variables:** see [GitHub settings this pipeline expects](#github-settings-this-pipeline-expects).

---

## Project Structure

```
digital-bridges/
├── .github/
│   ├── workflows/ci.yml          # checks on every pull request
│   ├── workflows/deploy.yml      # deploy when main changes
│   └── pull_request_template.md
├── client/                       # React + Vite PWA
│   ├── public/materials/         # trainer PDFs
│   ├── scripts/prerender.mjs     # static HTML per public route (SEO)
│   ├── src/
│   │   ├── routes/               # file-based routes ($ = URL parameter)
│   │   │   ├── index.tsx         # Home (hero + blocks)
│   │   │   ├── about.tsx, for-trainers.tsx, p.$slug.tsx
│   │   │   ├── courses.*.tsx, learn.*.tsx, news.*.tsx, verify.*.tsx
│   │   │   ├── _authenticated/   # dashboard, settings, trainer, cohorts
│   │   │   └── admin/            # courses, lessons, pages, news, media, translations ...
│   │   ├── components/
│   │   │   ├── site.tsx          # header, footer, cards, rich text, icons
│   │   │   ├── blocks.tsx        # page builder block registry and renderers
│   │   │   ├── admin.tsx         # admin shell, CRUD manager, media picker
│   │   │   ├── app-shell.tsx     # signed-in learner shell
│   │   │   └── share.tsx, assistant-widget.tsx, home-sections.tsx ...
│   │   ├── lib/                  # api, auth, content, i18n, offline, seo, consent
│   │   └── assets/fonts/         # self-hosted fonts
│   └── vite.config.ts            # PWA, Workbox, chunk splitting
├── server/                       # Express API
│   ├── content/                  # course JSON, pathways, categories, badges
│   ├── migrations/               # 001 ... 030 SQL files
│   └── src/
│       ├── index.ts              # bootstrap, middleware, routes, sitemap
│       ├── env.ts, db.ts, middleware.ts, migrate.ts
│       ├── routes/               # auth, content, public, profile, learner, trainer,
│       │                         #   admin, admin-translations, ai-admin, assistant, media
│       ├── lib/                  # auth, tokens, ai, translate, mailer, ratelimit, http
│       └── scripts/              # seed, export-content, content-schema, set-admin
├── deploy/
│   ├── deploy.sh                 # runs on the VPS for every deploy
│   ├── pm2/ecosystem.config.cjs  # keeps the API running
│   └── nginx/civicwise.online.conf
├── CONTRIBUTING.md               # branch workflow
└── docker-compose.yml            # optional all-in-one local stack
```

---

## Ownership Transfer Guide

Hand the platform to a new owner without downtime.

### Code
1. GitHub, the repository's Settings, General, Danger Zone, **Transfer ownership** to the new owner or organisation. Issues, pull requests, Actions history and secrets names move with it; secret **values** must be re-entered.
2. The new owner adds the Actions secrets and variables again, and replaces the VPS deploy key.
3. Update the `git remote` on the VPS: `git -C /var/www/civicwise/app remote set-url origin <new-url>`.

### Other services
| Service | What to transfer | How |
|---------|------------------|-----|
| Domain `civicwise.online` | Registrar account | Hostinger domain transfer or account change |
| VPS | Server access | Hostinger VPS ownership, or migrate (see below) |
| Database | All data | `pg_dump -Fc` on the old server, `pg_restore` on the new one |
| Cloudinary | Uploaded media | Transfer the account, or keep it and rotate the API secret |
| Gemini / Groq | AI keys | New owner creates keys, updates `server/.env` |
| SMTP mailbox | Email sending | Change the password, update `server/.env` |
| Admin accounts | Staff access | `npm run set-admin -- <email> --revoke` for people leaving |

### Rotate secrets at handover
- New `JWT_SECRET` (signs everyone out once), new database password, new SMTP, Cloudinary and AI keys, new deploy SSH key.

### Moving to a new server
1. Set up the new VPS with [Server Setup](#server-setup-on-the-vps-step-by-step).
2. Restore the latest `pg_dump`.
3. Point DNS at the new server, run Certbot there, update `VPS_HOST` and `VPS_KNOWN_HOSTS` in GitHub.

---

## Fresh Rebuild Guide

Run your own copy for a different organisation, country or domain.

### Step 1: Clone
```bash
git clone https://github.com/Harris-Jr/digital-bridges.git my-platform
```

### Step 2: Update hardcoded values
| Where | What |
|-------|------|
| `client/scripts/prerender.mjs`, `client/src/lib/seo.tsx` | `SITE_URL`, page titles and descriptions |
| `client/index.html` | Title, description, Organization JSON-LD |
| `client/vite.config.ts` | App name, description and colours in the PWA manifest |
| `client/public/` | Icons, `robots.txt`, `og-image.png`, trainer PDFs |
| `deploy/nginx/civicwise.online.conf` | Domain names and file name |
| `deploy/deploy.sh`, `deploy/pm2/ecosystem.config.cjs` | Paths under `/var/www/civicwise` |
| `.github/workflows/deploy.yml` | Live site URL in the health check |
| `client/src/components/site.tsx` | Footer credit line |

### Step 3: Content
1. Replace the course files in `server/content/` (keep the JSON shape; `npm run seed -- --check` validates it).
2. Edit pages, logo, partners, FAQs and testimonials in the admin after the first deploy.
3. Change or add languages in `client/src/lib/i18n.tsx` and the `i18n_strings` table.

### Step 4: Accounts
Create Cloudinary, AI and SMTP accounts and put the keys in `server/.env`.

### Step 5: Database and server
Follow [Database Setup](#database-setup-step-by-step) and [Server Setup](#server-setup-on-the-vps-step-by-step).

### Step 6: GitHub
Create the `develop` branch, protect `main`, add the Actions secrets and variables, and merge to deploy.

---

## Login Portals

| Portal | Address | Who |
|--------|---------|-----|
| Sign in / sign up | `/signin`, `/signup` | Everyone |
| My learning | `/dashboard` | Learners and trainers |
| Trainer tools | `/trainer` | Trainers |
| Admin | `/admin` | Editors and admins (staff land here after sign in) |
| Settings | `/settings` | Every signed-in account |

**Granting editor** (no admin screen for it yet):

```sql
insert into user_roles (user_id, role)
select id, 'editor' from users where email = 'person@example.org'
on conflict do nothing;
```

---

## License and Attribution

Developed as a [Zambia Cyber Security Foundation](https://zcsi-foundation.org) initiative. See the repository for license details.
