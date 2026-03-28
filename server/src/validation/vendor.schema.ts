import { z } from 'zod';

export const vendorQuerySchema = z.object({
  isActive: z.coerce.boolean().optional(),
  specialty: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
