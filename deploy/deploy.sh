#!/usr/bin/env bash
# Civic Wise deploy script. Runs ON the VPS, as the deploy user.
#
#   bash /var/www/civicwise/app/deploy/deploy.sh            deploy the latest main
#   bash /var/www/civicwise/app/deploy/deploy.sh <commit>   deploy (or roll back to) one commit
#   bash .../deploy.sh <commit> <folder>   use a web build made elsewhere (GitHub does this)
#
# GitHub Actions calls it after CI passes on main. It builds the web app on
# GitHub and uploads it first, so this server only builds the small API.
# Run by hand without a folder, the web app is built here (needs about 1.5 GB
# of free memory).
#
# Layout on the server:
#   /var/www/civicwise/app   git clone of the repo (this script lives here)
#   /var/www/civicwise/web   the built site nginx serves (copied from client/dist)
#   /var/www/civicwise/app/server/.env   production settings (never in git)
#
# Note on rollback: deploying an older commit rolls back the code, not the
# database. Migrations only ever add, so older code keeps working with a newer
# database in practice, but check the migration list before rolling back far.
set -euo pipefail

# This script updates its own file (git reset below). Bash reads a script as it
# runs, so run from a copy: the new version takes effect on the next deploy.
if [ -z "${CW_DEPLOY_COPY:-}" ]; then
  COPY=$(mktemp /tmp/civicwise-deploy.XXXXXX.sh)
  cp "$0" "$COPY"
  CW_DEPLOY_COPY=1 exec bash "$COPY" "$@"
fi
trap 'rm -f "$0"' EXIT

APP_DIR=/var/www/civicwise/app
WEB_DIR=/var/www/civicwise/web
TARGET="${1:-origin/main}"
PREBUILT="${2:-}"
LOG=/var/www/civicwise/deploy.log

# Only one deploy at a time, even if two are started.
exec 9>/var/www/civicwise/deploy.lock
flock -n 9 || { echo "Another deploy is running. Try again shortly."; exit 1; }

say() { printf '\n==> %s\n' "$*" | tee -a "$LOG"; }
say "Deploy $TARGET started $(date -Is)"

cd "$APP_DIR"

say "Fetching code"
git fetch --prune origin
# The server copy is for deploying only, so it is reset to the exact commit.
git reset --hard "$TARGET"
git clean -fd -e server/.env
COMMIT=$(git rev-parse --short HEAD)
say "Now at $COMMIT: $(git log -1 --pretty=%s)"

say "API: install, build"
cd "$APP_DIR/server"
npm ci --no-audit --no-fund
npm run build

# A backup before anything touches the database. The newest 14 are kept in
# /var/www/civicwise/backups. Restore one with:
#   pg_restore --clean --no-owner -d "<DATABASE_URL>" <file>
say "Database: backup"
BACKUP_DIR=/var/www/civicwise/backups
mkdir -p "$BACKUP_DIR" && chmod 700 "$BACKUP_DIR"
DB_URL=$(grep -E '^DATABASE_URL=' "$APP_DIR/server/.env" | head -n 1 | cut -d= -f2-)
BACKUP_FILE="$BACKUP_DIR/civicwise-$(date +%Y%m%d-%H%M%S)-$COMMIT.dump"
pg_dump -Fc --no-owner "$DB_URL" -f "$BACKUP_FILE"
chmod 600 "$BACKUP_FILE"
say "Saved $(du -h "$BACKUP_FILE" | cut -f1) to $BACKUP_FILE"
ls -1t "$BACKUP_DIR"/civicwise-*.dump 2>/dev/null | tail -n +15 | xargs -r rm -f --

say "Database: migrate, then add any new courses"
npm run migrate
# --new only adds courses that are not in the database yet. Courses that
# exist are never overwritten, so edits made in Admin are safe.
npm run seed -- --new

if [ -n "$PREBUILT" ] && [ -f "$PREBUILT/index.html" ]; then
  say "Web app: using the build uploaded by GitHub"
  WEB_SRC="$PREBUILT"
else
  say "Web app: install, build (on this server)"
  cd "$APP_DIR/client"
  npm ci --no-audit --no-fund
  npm run build
  WEB_SRC="$APP_DIR/client/dist"
fi

say "Restarting the API"
cd "$APP_DIR"
if pm2 describe civicwise-api > /dev/null 2>&1; then
  pm2 reload deploy/pm2/ecosystem.config.cjs --update-env
else
  pm2 start deploy/pm2/ecosystem.config.cjs
fi
pm2 save > /dev/null

say "Health check"
healthy=0
for i in $(seq 1 30); do
  if curl -fs http://127.0.0.1:4000/api/health > /dev/null 2>&1; then healthy=1; break; fi
  sleep 1
done
if [ "$healthy" != 1 ]; then
  say "API did not answer /api/health after the restart. The old site is still being served. Recent log:"
  pm2 logs civicwise-api --lines 40 --nostream || true
  exit 1
fi

# The new site goes live only after the API is healthy.
say "Publishing the built site"
mkdir -p "$WEB_DIR"
# Copy without --delete: tabs still open on the old version keep finding their
# old asset files. Hashed assets older than 30 days are cleaned up below.
rsync -a "$WEB_SRC/" "$WEB_DIR/"
find "$WEB_DIR/assets" -type f -mtime +30 -delete 2>/dev/null || true
[ -n "$PREBUILT" ] && rm -rf "$PREBUILT"

say "Deploy $COMMIT finished $(date -Is)"
