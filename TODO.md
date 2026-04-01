# TODO

## Technical Debt

- [ ] **Properly type implicit-any callback parameters in server services**
  `noImplicitAny` was disabled in `server/tsconfig.json` to unblock CI. The following
  service files have untyped lambda parameters that should be given explicit types:
  `analytics.service.ts`, `recurringGeneration.service.ts`, `sla.service.ts`,
  `vendor.service.ts`, `workOrder.service.ts`.

- [ ] **Import PhotoType from `@prisma/client` once prisma generate is stable in CI**
  `photo.service.ts` imports `PhotoType` from the shared frontend types
  (`src/types/index.ts`) as a workaround because `@prisma/client` only exports it after
  `prisma generate` runs. Once the CI `prisma generate` step is confirmed reliable, switch
  the import back to `import type { PhotoType } from '@prisma/client'`.

## Deployment & Infrastructure

- [ ] **Review app FRONTEND_URL doesn't allow Vercel preview frontend**
  Preview backends (`pr-N-casa-cre.fly.dev`) have `FRONTEND_URL` set to their own Fly URL.
  The CORS config only allows that exact origin, so any Vercel PR preview frontend is
  CORS-rejected and can't authenticate. Review apps currently work for direct API testing
  (curl, Postman) but not for end-to-end browser review.
  Fix: add a `PREVIEW_FRONTEND_URL` GitHub secret pointing to the Vercel preview base URL,
  and pass it as `FRONTEND_URL` in `fly-review.yml` instead of the Fly app URL.

- [ ] **Health check doesn't probe the database**
  `/api/health` returns static JSON — Prisma never connects at startup. A deploy with a
  wrong `DATABASE_URL` or an unreachable DB will pass the health check green, then 500 on
  every real API call. Add a `prisma.$queryRaw\`SELECT 1\`` probe to the health endpoint
  before this serves real users. See `server/src/app.ts`.

- [ ] **GitHub Actions pinned to tags/`@master`, not commit SHAs**
  `superfly/flyctl-actions/setup-flyctl@master` runs whatever Superfly pushes to `master`.
  A compromised upstream gets access to `FLY_API_TOKEN_*` and preview DB credentials.
  Best practice: pin all third-party actions to a commit SHA
  (e.g. `superfly/flyctl-actions/setup-flyctl@<sha>`).
  Affects: all four workflow files in `.github/workflows/`.
