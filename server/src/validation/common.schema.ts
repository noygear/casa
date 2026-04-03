import { z } from 'zod';

export const uuidParam = z.object({
  id: z.string().uuid(),
});

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const workOrderStatusEnum = z.enum([
  'open', 'assigned', 'in_progress', 'needs_review', 'closed', 'skipped',
]);

export const severityEnum = z.enum(['minor', 'needs_fix_today', 'immediate']);

export const categoryEnum = z.enum([
  'hvac', 'plumbing', 'electrical', 'fire_safety', 'elevator',
  'landscaping', 'janitorial', 'structural', 'tenant_request', 'general',
]);

export const userRoleEnum = z.enum(['asset_manager', 'property_manager', 'vendor', 'tenant']);

export const frequencyEnum = z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'annually', 'custom']);

export const photoTypeEnum = z.enum(['before', 'after', 'completion', 'start', 'invoice']);
