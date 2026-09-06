#!/usr/bin/env bash
set -euo pipefail

# Full stack release to the VPS: client, admin, backend, and database.
# - Syncs project files (does not wipe the Postgres volume)
# - Uploads .env.staging as remote .env
# - Backs up the database if it is already running
# - Rebuilds and starts: db, prestart (alembic + seed), backend, client, admin
#
# Usage:
#   ./scripts/release-full-to-vps.sh
#   ./scripts/release-full-to-vps.sh root@31.172.87.222
#   ./scripts/release-full-to-vps.sh root@31.172.87.222 /root/code/app

HOST="${1:-root@31.172.87.222}"
REMOTE_DIR="${2:-/root/code/app}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env.staging"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE"
  echo "Copy .env.staging.example to .env.staging and fill values first."
  exit 1
fi

echo "→ Ensuring remote directories exist"
ssh "$HOST" "mkdir -p '$REMOTE_DIR' /root/code/backups"

echo "→ Syncing project to $HOST:$REMOTE_DIR"
rsync -av --filter=":- .gitignore" \
  --exclude '.env' \
  --exclude '.env.staging' \
  --exclude '.git' \
  --exclude 'compose.override.yml' \
  --exclude 'frontend/node_modules' \
  --exclude 'frontend/dist' \
  --exclude 'frontend/.angular' \
  --exclude 'backend/.venv' \
  --exclude '.venv' \
  "$ROOT/" "$HOST:$REMOTE_DIR/"

echo "→ Uploading .env.staging as remote .env"
scp "$ENV_FILE" "$HOST:$REMOTE_DIR/.env"

echo "→ Remote backup + rebuild (db, backend, client, admin)"
ssh -t "$HOST" "chmod +x '$REMOTE_DIR/scripts/remote-rebuild-stack.sh' && '$REMOTE_DIR/scripts/remote-rebuild-stack.sh'"

echo
echo "Release finished."
echo "  Client:  http://31.172.87.222:8080/"
echo "  Admin:   http://31.172.87.222:8081/"
echo "  API:     http://31.172.87.222:8000/docs"
echo "  Adminer: http://31.172.87.222:8082/"
echo
echo "Database volume app-db-data is kept. prestart ran alembic upgrade head."
