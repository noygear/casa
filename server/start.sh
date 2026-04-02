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

# Seed only if the database is empty (idempotent guard)
USER_COUNT=$(node -e "
const { PrismaClient } = require('./node_modules/@prisma/client');
const p = new PrismaClient();
p.user.count().then(n => { console.log(n); p.\$disconnect(); }).catch(() => { console.log(0); p.\$disconnect(); });
")
if [ "$USER_COUNT" = "0" ]; then
  echo "[startup] database is empty — running seed..."
  node dist/server/prisma/seed.js
  echo "[startup] seed complete"
else
  echo "[startup] database already seeded ($USER_COUNT users) — skipping"
fi

exec node dist/server/src/index.js
