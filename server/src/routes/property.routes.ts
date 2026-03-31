import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createPropertySchema, propertyQuerySchema } from '../validation/property.schema.js';
import * as propertyService from '../services/property.service.js';

const router = Router();

router.use(authenticate);

router.get('/', validate(propertyQuerySchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await propertyService.listProperties(req.query as any);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const property = await propertyService.getProperty(req.params.id as string);
    res.json(property);
  } catch (error) {
    next(error);
  }
});

router.post('/',
  requireRole('asset_manager', 'property_manager'),
  validate(createPropertySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const property = await propertyService.createProperty(req.body);
      res.status(201).json(property);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
