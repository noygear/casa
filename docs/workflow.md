# Workflow

This document describes how Casa CRE moves code from local development to staging, production, and pull request preview environments.

It also captures the current Fly.io topology as of 2026-04-01 so contributors can reason about the live environment without reverse-engineering the repo or dashboard.

## Deployment authority

Cloud deployment is centralized.

Contributors should not create separate Fly applications, point the repository at personal Fly accounts, or treat ad hoc Fly deployments as part of the official contribution path.

The official deployment authority is:

- this repository
- the Noygear Fly organization
- the GitHub Actions workflows in `.github/workflows/`

That keeps environment naming, secrets, database topology, and reviewer links consistent.

## Where the deployment details live

The repository does contain the operational Fly deployment details. They are split by purpose:

- `docs/workflow.md`
  This file documents the environment model, the branch strategy, the current Fly topology, and the maintainer workflow.
- `fly.toml`
  Production Fly app configuration for `casa-cre-prod`.
- `fly.staging.toml`
  Staging Fly app configuration for `casa-cre-staging`.
- `fly.review.toml`
  Review app configuration template for PR preview apps.
- `.github/workflows/fly-prod.yml`
  Production deployment automation.
- `.github/workflows/fly-staging.yml`
  Staging deployment automation.
- `.github/workflows/fly-review.yml`
  Preview app creation, PR commenting, and preview teardown automation.
- `.github/workflows/validate.yml`
  CI validation for all pull requests.

This means maintainers can understand how the system is deployed directly from the repository without having to inspect the Fly dashboard first.

## What is intentionally not stored in the repository

The repository should not contain live secret material.

Keep these outside Git:

- Fly API tokens
- database passwords
- full database connection strings
- JWT secrets
- DNS provider credentials

The right place for those is a password manager, secret vault, or another access-controlled maintainer system.

## Why this workflow exists

The project uses three environment layers on purpose:

- `main` drives production because production should be the most stable and intentional branch.
- `develop` drives staging because staging is the integration environment for work that is likely to ship soon but should not land in production yet.
- Pull requests into `develop` get preview apps because reviewers need a cheap, short-lived way to validate changes before they affect staging.

This structure gives the team a clean path:

1. Build and test locally.
2. Open a PR for review with a preview app.
3. Merge into `develop` to validate the integrated result on staging.
4. Merge `develop` into `main` to release to production.

## Branch to environment mapping

| Source | Target environment | Fly app | URL | Trigger |
| --- | --- | --- | --- | --- |
| `main` | Production | `casa-cre-prod` | `https://casa.noygear.com` | Push to `main` |
| `develop` | Staging | `casa-cre-staging` | `https://casa-cre-staging.fly.dev` | Push to `develop` |
| PR into `develop` | Preview | `pr-<number>-casa-cre` | `https://pr-<number>-casa-cre.fly.dev` | `pull_request` workflow |

## Current Fly topology

### Production

- Fly app: `casa-cre-prod`
- Primary app region: `ord`
- Public URLs:
  - `https://casa.noygear.com`
  - `https://casa-cre-prod.fly.dev`
- Runtime shape:
  - shared CPU
  - 1 CPU
  - 1 GB memory
- Runtime behavior:
  - `auto_stop_machines = "stop"`
  - `auto_start_machines = true`
  - `min_machines_running = 1`
- Release behavior:
  - `npx prisma migrate deploy`

#### Production database

- Database: `casa-cre-db` (on the `talent-os-prod-db` managed cluster)
- Type: Fly Managed Postgres (shared cluster with talent-os)
- Plan: `basic`
- Region: `iad`
- Attached to: `casa-cre-prod` via `DATABASE_URL` / `DIRECT_URL` secrets

#### Why production uses managed Postgres

- Production data is the highest-value data in the system.
- Sharing the `talent-os-prod-db` managed cluster avoids the cost of a second managed cluster while retaining managed Postgres reliability.
- The `casa-cre-db` database is isolated within the cluster from the talent-os database.

### Staging

- Fly app: `casa-cre-staging`
- Primary app region: `ord`
- Public URL:
  - `https://casa-cre-staging.fly.dev`
- Runtime shape:
  - shared CPU
  - 1 CPU
  - 1 GB memory
- Runtime behavior:
  - `auto_stop_machines = "suspend"`
  - `auto_start_machines = true`
  - `min_machines_running = 0`
- Release behavior:
  - `npx prisma migrate deploy`

#### Staging database

- Database app: `casa-cre-staging-db`
- Type: unmanaged Fly Postgres (`postgres-flex`)
- Region: `ord`
- Shape:
  - single-node
  - shared CPU
  - 1x size

#### Why staging uses unmanaged Postgres

- Staging needs to be real enough for integration testing, but it does not justify managed production pricing.
- The current staging workload is small and fully disposable.
- A single unmanaged database is the best cost-to-usefulness tradeoff for a prototype environment.

### Preview apps

- Fly app pattern: `pr-<number>-casa-cre`
- Primary app region: `ord`
- Runtime shape:
  - shared CPU
  - 1 CPU
  - 256 MB memory
- Runtime behavior:
  - `auto_stop_machines = "stop"`
  - `auto_start_machines = true`
  - `min_machines_running = 0`
- Lifecycle:
  - created or updated when a PR into `develop` is opened, reopened, or synchronized
  - destroyed when the PR is closed

#### Preview database

- Database app: `casa-cre-preview-db`
- Type: unmanaged Fly Postgres (`postgres-flex`)
- Region: `dfw`
- Shape:
  - single-node
  - shared CPU 1x
  - 256 MB memory

#### Why preview uses a shared unmanaged database

- Preview environments must be cheap enough to create on every PR.
- A dedicated database per PR would be operationally clean but too expensive for the current phase.
- A single shared preview DB keeps the review loop lightweight and fast.

#### Important preview tradeoff

Preview apps do **not** run Prisma migrations automatically.

That is deliberate. A shared preview database plus automatic schema mutation on every PR would let branches interfere with each other. Instead:

- the shared preview DB is bootstrapped once with the current schema and seed data
- preview apps reuse that shared state
- schema-heavy changes should be validated more carefully in staging before promotion

## GitHub Actions workflows

### Production workflow

- File: `.github/workflows/fly-prod.yml`
- Trigger: push to `main`
- Token secret: `FLY_API_TOKEN_PROD`
- Deploy command:
  - `flyctl deploy --remote-only --config fly.toml --app casa-cre-prod`

### Staging workflow

- File: `.github/workflows/fly-staging.yml`
- Trigger: push to `develop`
- Token secret: `FLY_API_TOKEN_STAGING`
- Deploy command:
  - `flyctl deploy --remote-only --config fly.staging.toml --app casa-cre-staging`
- Behavior:
  - on a successful deploy triggered by a push to `develop`, the workflow updates the merged PR with the staging URL, commit SHA, and workflow run link
  - on a failed deploy triggered by a push to `develop`, the workflow updates the merged PR with a failure comment and run link so staging failures are visible in GitHub
  - if the `develop` push is not associated with a merged PR, the deploy still succeeds and the comment step exits without failing the job

### Validation workflow

- File: `.github/workflows/validate.yml`
- Trigger: pull requests into `develop` or `main`
- Behavior:
  - requires a committed Prisma migration whenever `prisma/schema.prisma` changes
  - applies committed migrations against disposable Postgres in CI
  - runs `lint`, frontend `build`, and server `build`

### Branch protection expectation

- `develop` should require the `validate` check before merge
- `main` should require the `validate` check before merge
- `develop` should keep the preview app workflow visible for reviewers, even if it is not a merge-blocking check

### Review app workflow

- File: `.github/workflows/fly-review.yml`
- Trigger: pull requests into `develop`
- Token secret: `FLY_API_TOKEN_REVIEW`
- App naming:
  - `pr-<number>-casa-cre`
- Additional GitHub repository secrets required:
  - `PREVIEW_DATABASE_URL`
  - `PREVIEW_DIRECT_URL`
  - `REVIEW_JWT_SECRET`

## Maintainer runbook

These are the canonical deployment entry points for maintainers.

### Production

- Deploy trigger:
  - push to `main`
- Manual fallback:
  - `flyctl deploy --remote-only --config fly.toml --app casa-cre-prod`
- Seed command:
  - `flyctl ssh console -a casa-cre-prod -C "node dist/server/prisma/seed.js"`

### Staging

- Deploy trigger:
  - push to `develop`
- Manual fallback:
  - `flyctl deploy --remote-only --config fly.staging.toml --app casa-cre-staging`
- Seed command:
  - `flyctl ssh console -a casa-cre-staging -C "node dist/server/prisma/seed.js"`

### Preview apps

- Deploy trigger:
  - PR opened, reopened, or synchronized into `develop`
- Destroy trigger:
  - PR closed
- App naming:
  - `pr-<number>-casa-cre`
- Behavior:
  - the workflow comments the preview URL on the PR
  - the workflow comments whether preview teardown succeeded or failed when the PR closes

## Secrets model

### Fly app secrets

Production and staging keep runtime secrets on the Fly app itself, not in Git.

Examples:

- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`
- `FRONTEND_URL`

### GitHub repository secrets

GitHub Actions holds only the secrets it needs for CI/CD orchestration.

Examples:

- `FLY_API_TOKEN_PROD`
- `FLY_API_TOKEN_STAGING`
- `FLY_API_TOKEN_REVIEW`
- `PREVIEW_DATABASE_URL`
- `PREVIEW_DIRECT_URL`
- `REVIEW_JWT_SECRET`

### Secret handling rules

- Never commit secrets into the repository.
- Store database URLs, passwords, JWT secrets, and Fly tokens in a password manager.
- Treat database URLs as secrets because they embed credentials.

## Day-to-day contribution flow

1. Branch from `develop`.
2. Make the change locally and verify it.
3. Push the feature branch.
4. Open a PR into `develop`.
5. Wait for the `validate` workflow to pass.
6. Use the preview app to validate the change.
7. Merge into `develop` once the PR is approved.
8. Confirm staging deploys successfully from the merged PR comment.
9. Merge `develop` into `main`.
10. Let the production workflow deploy the production app.

## What contributors should not do

- Do not run `fly launch` for this project as part of the official workflow.
- Do not deploy personal copies of the repository as if they were canonical preview, staging, or production environments.
- Do not create new Fly apps for this project outside the approved Noygear environment naming scheme.
- Do not point preview, staging, or production workflows at personal databases or personal Fly organizations.

## How to smoke-test the environment workflow

To verify the whole chain without touching core application logic:

1. Create a small docs-only branch from `develop`.
2. Push it and open a PR into `develop`.
3. Confirm the review-app workflow creates a preview app.
4. Merge the PR into `develop`.
5. Confirm the staging workflow deploys successfully and updates the merged PR comment with `https://casa-cre-staging.fly.dev`.
6. Merge `develop` into `main`.
7. Confirm the production workflow deploys successfully.

## Current architectural tradeoffs

- Production uses managed Postgres (shared `talent-os-prod-db` cluster), while staging and preview use unmanaged Postgres to reduce cost.
- Preview apps share one database, which is cost-efficient but not isolated.
- The application uses JWT cookie auth suitable for internal prototype use.
- The `casa-cre-db` production database was pre-created on the existing managed cluster; connection details are set as Fly app secrets.

## Upgrade path

The current setup is intentionally pragmatic, not final. The next likely upgrades are:

- move preview DB isolation from one shared database to one schema per PR
- decide whether staging should stay suspendable or keep one machine warm
- add stronger auth and reviewer access controls if the audience expands
- evaluate whether production should graduate to its own dedicated managed cluster
