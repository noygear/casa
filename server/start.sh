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

npx prisma migrate deploy --schema=./prisma/schema.prisma

# Always run seed — seed.ts auto-detects legacy non-UUID data and clears it,
# then upserts all records. Safe to run on every startup.
echo "[startup] running seed..."
node dist/server/prisma/seed.js
echo "[startup] seed complete"

exec node dist/server/src/index.js
