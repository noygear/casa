# Add Feature Workflow

When building a new feature end-to-end:

1. **Check the PRD** — Confirm the feature maps to a requirement ID (C-01 through C-19).
2. **Update Prisma schema** if new models or fields are needed. Run `prisma migrate dev`.
3. **Write domain logic** in `src/domain/` as a pure function. No framework imports.
4. **Write unit tests** for the domain function.
5. **Build API endpoint** — Route + Service + Zod validation. See `/add-endpoint`.
6. **Build frontend component** — Page or modal in `src/pages/` or `src/components/`.
7. **Connect to API** via React Query hook in `src/hooks/`.
8. **Add RBAC checks** — Server-side middleware + client-side UI gating.
9. **Test the full flow** — Create, read, update through the UI with each user role.
10. **Update mock data** if needed for demo purposes.
