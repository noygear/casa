# ── Frontend Builder ───────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy frontend source
COPY package.json package-lock.json* ./
COPY tsconfig*.json ./
COPY vite.config.* ./
COPY tailwind.config.* ./
COPY postcss.config.* ./
COPY index.html ./
COPY src/ ./src/
COPY public/ ./public/ 2>/dev/null || true

RUN npm ci
RUN npm run build

# ── Backend Builder ────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy prisma schema (shared between frontend and backend)
COPY prisma/ ./prisma/

# Copy shared domain logic and types
COPY src/domain/ ./src/domain/
COPY src/types/ ./src/types/

# Copy server source and seed script
COPY server/package.json server/package-lock.json* ./server/
COPY server/tsconfig.json ./server/
COPY server/src/ ./server/src/
COPY server/prisma/ ./server/prisma/

# Install dependencies and generate Prisma client
WORKDIR /app/server
RUN npm ci
RUN npx prisma generate --schema=../prisma/schema.prisma
RUN npx tsc

# ── Runtime Stage ──────────────────────────────────────────────
FROM node:20-alpine AS runtime

WORKDIR /app

# Copy built backend
COPY --from=builder /app/server/dist/ ./dist/
COPY --from=builder /app/server/node_modules/ ./node_modules/
COPY --from=builder /app/prisma/ ./prisma/

# Copy built frontend
COPY --from=frontend-builder /app/dist/ ./public/

# Re-generate Prisma client for runtime
RUN npx prisma generate --schema=./prisma/schema.prisma

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "dist/server/src/index.js"]
