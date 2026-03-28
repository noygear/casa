import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import * as propertyService from '../services/property.service.js';

const router = Router();

router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const propertyId = req.query.propertyId as string | undefined;
    const spaces = await propertyService.listSpaces(propertyId);
    res.json(spaces);
  } catch (error) {
    next(error);
  }
});

export default router;
