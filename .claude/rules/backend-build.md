# Backend Build Plan

Casa's frontend is complete with mock data. The backend must be built from scratch. Follow this plan in order.

## Phase 1: Foundation

1. **Initialize Express + TypeScript backend** in a new `server/` directory (or convert to monorepo with `apps/api` and `apps/web`).
2. **Connect Prisma ORM** to PostgreSQL. The schema is already defined at `prisma/schema.prisma` with 14 models. Run `prisma generate` and `prisma migrate dev`.
3. **Implement authentication**: JWT tokens with bcrypt password hashing. Store tokens in httpOnly cookies. Create `RevokedToken` model for logout (no Redis). Daily cron cleans expired tokens.
4. **Seed database**: Create demo users matching the 5 mock accounts (asset manager, property manager, 2 vendors, 1 tenant). Seed 3 properties, 10 spaces, 3 vendors, and 15+ work orders.

## Phase 2: Core API

Build REST endpoints that mirror the frontend's data needs:

```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/work-orders          # Filters: status, severity, category, assignedTo, vendor
GET    /api/work-orders/:id      # Include photos + audit log
POST   /api/work-orders          # Create with validation
PATCH  /api/work-orders/:id      # State transition (calls domain state machine)

POST   /api/work-orders/:id/photos   # Upload to Cloudinary/S3
GET    /api/vendors                   # With score breakdown
GET    /api/properties                # With space list
GET    /api/sla-compliance            # Metrics dashboard data

POST   /api/recurring-templates       # Create PM schedule
GET    /api/recurring-templates       # List active templates
```

## Phase 3: Integration

1. **Replace mock data** in frontend with API calls. Use React Query (install `@tanstack/react-query`) for server state management.
2. **Replace mock auth** in `src/contexts/AuthContext.tsx` with real JWT flow.
3. **Add photo upload** to Cloudinary (with base64 fallback for dev).
4. **Add email notifications** via SendGrid or Resend for ticket events and SLA breaches.

## Architecture Rules

- **Thin routes**: Routes validate input with Zod and call services. No business logic in route handlers.
- **Service layer**: Services orchestrate Prisma queries and domain function calls.
- **Domain stays pure**: Import state machine and scoring engine from `src/domain/`. Do not duplicate logic.
- **Error handling**: Use typed error classes. Return descriptive JSON errors, never generic 500s.
- **Input validation**: Zod schemas for every request body and query parameter.
