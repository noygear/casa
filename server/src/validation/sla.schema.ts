import { z } from 'zod';
import { categoryEnum, severityEnum } from './common.schema.js';

export const upsertSLAConfigSchema = z.object({
  propertyId: z.string().uuid(),
  category: categoryEnum,
  severity: severityEnum,
  responseTimeMin: z.number().int().min(1),
  resolveTimeMin: z.number().int().min(1),
});

export const slaConfigQuerySchema = z.object({
  propertyId: z.string().uuid().optional(),
});
