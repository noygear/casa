#!/bin/sh
set -e

# Fly.io internal connections (.flycast / .internal) go over WireGuard,
# which already encrypts traffic. PostgreSQL on Fly uses a self-signed cert
# that Prisma rejects. Disable TLS at the PG level for these hosts.
patch_url() {
  local url="$1"
  if echo "$url" | grep -qE '\.(flycast|internal)'; then
    if ! echo "$url" | grep -q 'sslmode'; then
      if echo "$url" | grep -q '?'; then
        echo "${url}&sslmode=disable"
      else
        echo "${url}?sslmode=disable"
      fi
      return
    fi
  fi
  echo "$url"
}

if [ -n "$DATABASE_URL" ]; then
  export DATABASE_URL="$(patch_url "$DATABASE_URL")"
fi
if [ -n "$DIRECT_URL" ]; then
  export DIRECT_URL="$(patch_url "$DIRECT_URL")"
fi

echo "[startup] DATABASE_URL host: $(echo "$DATABASE_URL" | sed 's|.*@||;s|/.*||')"

# Preview/review environments: reset DB on each deploy so migrations always
# run against a clean state, preventing orphaned failed-migration records.
if [ "$RESET_DB" = "true" ]; then
  echo "[startup] RESET_DB=true — resetting database..."
  npx prisma migrate reset --force --schema=./prisma/schema.prisma
  echo "[startup] database reset complete"
else
  # Detect a previously failed migration (P3009) and surface a clear message
  # rather than crash-looping. Operators must resolve via:
  #   fly postgres connect -a <db-app> -- psql -c "DELETE FROM _prisma_migrations WHERE migration_name='<name>' AND finished_at IS NULL AND rolled_back_at IS NULL;"
  migrate_output=$(npx prisma migrate deploy --schema=./prisma/schema.prisma 2>&1)
  migrate_exit=$?
  echo "$migrate_output"
  if echo "$migrate_output" | grep -q "P3009"; then
    failed_name=$(echo "$migrate_output" | grep -oE 'The `[^`]+` migration' | head -1 | sed "s/The \`//;s/\` migration//")
    echo ""
    echo "[startup] ERROR: Migration '$failed_name' is stuck in a failed state."
    echo "[startup] To fix, connect to the database and run:"
    echo "[startup]   DELETE FROM _prisma_migrations WHERE migration_name='$failed_name' AND finished_at IS NULL AND rolled_back_at IS NULL;"
    exit 1
  fi
  if [ $migrate_exit -ne 0 ]; then
    exit $migrate_exit
  fi
fi

# Always run seed — seed.ts auto-detects legacy non-UUID data and clears it,
# then upserts all records. Safe to run on every startup.
echo "[startup] running seed..."
node dist/server/prisma/seed.js
echo "[startup] seed complete"

exec node dist/server/src/index.js
