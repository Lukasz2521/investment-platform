#!/usr/bin/env bash
set -euo pipefail

# Sync only frontend/ to the VPS. Does not touch .env or backend.
# Usage:
#   ./scripts/sync-frontend-to-vps.sh
#   ./scripts/sync-frontend-to-vps.sh root@31.172.87.222
#   ./scripts/sync-frontend-to-vps.sh root@31.172.87.222 /root/code/app

HOST="${1:-root@31.172.87.222}"
REMOTE_DIR="${2:-/root/code/app}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "→ Ensuring remote frontend directory exists: $REMOTE_DIR/frontend"
ssh "$HOST" "mkdir -p '$REMOTE_DIR/frontend'"

echo "→ Syncing frontend to $HOST:$REMOTE_DIR/frontend"
rsync -av --filter=":- .gitignore" \
  --exclude 'node_modules' \
  --exclude 'dist' \
  "$ROOT/frontend/" "$HOST:$REMOTE_DIR/frontend/"

echo
echo "Done. Frontend files are on the server."
echo "Rebuild only the client app:"
echo "  ssh $HOST"
echo "  cd $REMOTE_DIR"
echo "  docker compose -f compose.yml -f compose.ip.yml up -d --build client"
