import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createRecurringTemplateSchema, updateRecurringTemplateSchema } from '../validation/recurring.schema.js';
import * as recurringService from '../services/recurring.service.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('asset_manager', 'property_manager'));

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const templates = await recurringService.listTemplates();
    res.json(templates);
  } catch (error) {
    next(error);
  }
});

router.post('/', validate(createRecurringTemplateSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const template = await recurringService.createTemplate(req.body);
    res.status(201).json(template);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', validate(updateRecurringTemplateSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const template = await recurringService.updateTemplate(req.params.id as string, req.body);
    res.json(template);
  } catch (error) {
    next(error);
  }
});

export default router;
