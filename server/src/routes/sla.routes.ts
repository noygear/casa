import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import * as slaService from '../services/sla.service.js';
import * as analyticsService from '../services/analytics.service.js';

const router = Router();

router.use(authenticate);

router.get('/compliance',
  requireRole('asset_manager', 'property_manager'),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await slaService.getSLACompliance();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/analytics',
  requireRole('asset_manager'),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await analyticsService.getPortfolioAnalytics();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
