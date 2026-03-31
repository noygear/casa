import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { vendorQuerySchema } from '../validation/vendor.schema.js';
import * as vendorService from '../services/vendor.service.js';

const router = Router();

router.use(authenticate);

router.get('/', validate(vendorQuerySchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await vendorService.listVendors(req.query as any);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/scores', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const scores = await vendorService.getVendorScores();
    res.json(scores);
  } catch (error) {
    next(error);
  }
});

router.get('/referrals', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const referrals = await vendorService.getReferrals();
    res.json(referrals);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendor = await vendorService.getVendor(req.params.id as string);
    res.json(vendor);
  } catch (error) {
    next(error);
  }
});

export default router;
