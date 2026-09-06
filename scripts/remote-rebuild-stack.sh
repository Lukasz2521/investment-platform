#!/usr/bin/env bash
set -euo pipefail

# Runs ON the VPS from the project root. Rebuilds client, admin, backend, db.
COMPOSE="docker compose -f compose.yml -f compose.ip.yml"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

mkdir -p /root/code/backups

if $COMPOSE exec -T db pg_isready </dev/null >/dev/null 2>&1; then
  STAMP=$(date +%Y%m%d-%H%M%S)
  echo "→ Dumping database to /root/code/backups/db-$STAMP.sql"
  $COMPOSE exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB"' </dev/null \
    > "/root/code/backups/db-$STAMP.sql"
else
  echo "→ Database is not running yet — skipping dump (first deploy)"
fi

echo "→ Building and starting the full stack"
$COMPOSE up -d --build --force-recreate --remove-orphans
echo "→ Stack status"
$COMPOSE ps
