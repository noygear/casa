import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { upsertSLAConfigSchema, slaConfigQuerySchema } from '../validation/sla.schema.js';
import * as slaService from '../services/sla.service.js';
import * as analyticsService from '../services/analytics.service.js';

const router = Router();

router.use(authenticate);

// ── SLA Configuration CRUD ──────────────────────────────────

router.get('/configs',
  requireRole('asset_manager', 'property_manager'),
  validate(slaConfigQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const propertyId = typeof req.query.propertyId === 'string' ? req.query.propertyId : undefined;
      const configs = await slaService.listSLAConfigs(propertyId);
      res.json(configs);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/configs',
  requireRole('asset_manager', 'property_manager'),
  validate(upsertSLAConfigSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const config = await slaService.upsertSLAConfig(req.body);
      res.json(config);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/configs/:id',
  requireRole('asset_manager', 'property_manager'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await slaService.deleteSLAConfig(req.params.id as string);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
);

// ── SLA Compliance & Analytics ──────────────────────────────

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
