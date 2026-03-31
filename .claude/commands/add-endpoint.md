# Add API Endpoint

When adding a new REST endpoint, follow this checklist:

1. **Define Zod schema** for request body and query parameters in the route file.
2. **Create route handler** that validates input, calls service, returns response.
3. **Create or update service function** that orchestrates Prisma queries and domain logic.
4. **Add RBAC middleware** (`requireRole()`) if the endpoint is role-restricted.
5. **Add audit log entry** if the endpoint modifies ticket state.
6. **Update TypeScript types** in `src/types/index.ts` if new response shapes are introduced.
7. **Test with curl or Postman** against the dev server.

Template:
```typescript
// routes/example.ts
import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

const CreateSchema = z.object({
  title: z.string().min(1),
  // ... fields
});

router.post('/', authenticate, requireRole('property_manager', 'asset_manager'), async (req, res) => {
  const parsed = CreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const result = await someService.create(parsed.data, req.user);
  res.status(201).json(result);
});

export default router;
```
