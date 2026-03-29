import { z } from 'zod';
import { severityEnum, categoryEnum, frequencyEnum } from './common.schema.js';

export const createRecurringTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  category: categoryEnum,
  severity: severityEnum.default('minor'),
  frequency: frequencyEnum,
  customDays: z.number().int().positive().optional(),
  propertyId: z.string().min(1),
  spaceId: z.string().min(1).optional(),
  vendorId: z.string().min(1).optional(),
});

export const updateRecurringTemplateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  severity: severityEnum.optional(),
  frequency: frequencyEnum.optional(),
  customDays: z.number().int().positive().optional().nullable(),
  vendorId: z.string().min(1).optional().nullable(),
  isActive: z.boolean().optional(),
});
