#!/usr/bin/env bash
set -euo pipefail

# Sync project + staging env to the VPS.
# Usage:
#   ./scripts/sync-to-vps.sh
#   ./scripts/sync-to-vps.sh root@31.172.87.222
#   ./scripts/sync-to-vps.sh root@31.172.87.222 /root/code/app

HOST="${1:-root@31.172.87.222}"
REMOTE_DIR="${2:-/root/code/app}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env.staging"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE"
  echo "Copy .env.staging.example to .env.staging and fill values first."
  exit 1
fi

echo "→ Ensuring remote directory exists: $REMOTE_DIR"
ssh "$HOST" "mkdir -p '$REMOTE_DIR'"

echo "→ Syncing project files to $HOST:$REMOTE_DIR"
rsync -av --filter=":- .gitignore" \
  --exclude '.env' \
  --exclude '.env.staging' \
  --exclude 'frontend/node_modules' \
  --exclude 'frontend/dist' \
  --exclude '.git' \
  "$ROOT/" "$HOST:$REMOTE_DIR/"

echo "→ Uploading .env.staging as remote .env"
scp "$ENV_FILE" "$HOST:$REMOTE_DIR/.env"

echo
echo "Done."
echo "On the server run:"
echo "  ssh $HOST"
echo "  cd $REMOTE_DIR"
echo "  docker compose -f compose.yml -f compose.ip.yml up -d --build"
