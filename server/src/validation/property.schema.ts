import { z } from 'zod';

export const createPropertySchema = z.object({
  name: z.string().min(1).max(200),
  address: z.string().min(1).max(300),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(50),
  zipCode: z.string().min(1).max(20),
  type: z.string().min(1).max(50),
  totalSqFt: z.number().int().positive().optional(),
  yearBuilt: z.number().int().min(1800).max(2100).optional(),
  imageUrl: z.string().url().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  occupancyPercent: z.number().min(0).max(100).optional(),
  monthlyRevenue: z.number().min(0).optional(),
});

export const propertyQuerySchema = z.object({
  type: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
