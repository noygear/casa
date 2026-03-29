import { z } from 'zod';
import { workOrderStatusEnum, severityEnum, categoryEnum, photoTypeEnum } from './common.schema.js';

export const createWorkOrderSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  severity: severityEnum.default('minor'),
  category: categoryEnum.default('general'),
  isInspection: z.boolean().default(false),
  propertyId: z.string().min(1),
  spaceId: z.string().min(1).optional().nullable(),
  vendorId: z.string().min(1).optional().nullable(),
  assignedToId: z.string().min(1).optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
});

export const updateWorkOrderSchema = z.object({
  status: workOrderStatusEnum.optional(),
  assignedToId: z.string().min(1).optional().nullable(),
  vendorId: z.string().min(1).optional().nullable(),
  cost: z.number().min(0).optional().nullable(),
  comment: z.string().max(1000).optional(),
});

export const workOrderQuerySchema = z.object({
  status: workOrderStatusEnum.optional(),
  severity: severityEnum.optional(),
  category: categoryEnum.optional(),
  propertyId: z.string().min(1).optional(),
  vendorId: z.string().min(1).optional(),
  assignedToId: z.string().min(1).optional(),
  createdById: z.string().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const uploadPhotoSchema = z.object({
  url: z.string().min(1),
  type: photoTypeEnum,
  caption: z.string().max(500).optional(),
  gpsLatitude: z.number().optional(),
  gpsLongitude: z.number().optional(),
  gpsAccuracy: z.number().optional(),
});
