import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import prisma from '../prisma.js';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { categoryEnum } from '../validation/common.schema.js';

const router = Router();

router.use(authenticate);

const createMappingSchema = z.object({
  propertyId: z.string().uuid(),
  category: categoryEnum,
  vendorId: z.string().uuid(),
  priority: z.number().int().min(1).default(1),
});

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const mappings = await prisma.preferredVendorMapping.findMany({
      include: {
        property: { select: { id: true, name: true } },
        vendor: { select: { id: true, companyName: true } },
      },
      orderBy: [{ propertyId: 'asc' }, { category: 'asc' }, { priority: 'asc' }],
    });
    res.json(mappings);
  } catch (error) {
    next(error);
  }
});

router.post('/',
  requireRole('asset_manager', 'property_manager'),
  validate(createMappingSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mapping = await prisma.preferredVendorMapping.create({
        data: req.body,
        include: {
          property: { select: { id: true, name: true } },
          vendor: { select: { id: true, companyName: true } },
        },
      });
      res.status(201).json(mapping);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
