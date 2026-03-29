import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  createWorkOrderSchema,
  updateWorkOrderSchema,
  workOrderQuerySchema,
  uploadPhotoSchema,
} from '../validation/workOrder.schema.js';
import * as workOrderService from '../services/workOrder.service.js';
import * as photoService from '../services/photo.service.js';
import * as invoiceService from '../services/invoice.service.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', validate(workOrderQuerySchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await workOrderService.listWorkOrders(req.query as any, req.user!);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wo = await workOrderService.getWorkOrder(req.params.id as string, req.user!);
    res.json(wo);
  } catch (error) {
    next(error);
  }
});

router.post('/', validate(createWorkOrderSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wo = await workOrderService.createWorkOrder(req.body, req.user!);
    res.status(201).json(wo);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', validate(updateWorkOrderSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wo = await workOrderService.updateWorkOrder(req.params.id as string, req.body, req.user!);
    res.json(wo);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/photos', validate(uploadPhotoSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const photo = await photoService.uploadPhoto({
      workOrderId: req.params.id as string,
      ...req.body,
    });
    res.status(201).json(photo);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/photos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const photos = await photoService.getPhotos(req.params.id as string);
    res.json(photos);
  } catch (error) {
    next(error);
  }
});

// Invoice parsing: upload image → AI extracts line items
router.post('/:id/invoice/parse', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { image } = req.body;
    if (!image || typeof image !== 'string') {
      res.status(400).json({ error: 'VALIDATION_ERROR', message: 'image (base64) is required' });
      return;
    }
    const extracted = await invoiceService.parseInvoice(image);
    res.json(extracted);
  } catch (error) {
    next(error);
  }
});

// Invoice confirmation: save confirmed line items
router.post('/:id/invoice/confirm', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lineItems, invoiceImageUrl } = req.body;
    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      res.status(400).json({ error: 'VALIDATION_ERROR', message: 'lineItems array is required' });
      return;
    }
    const result = await invoiceService.saveInvoiceLineItems(
      req.params.id as string,
      lineItems,
      invoiceImageUrl
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
