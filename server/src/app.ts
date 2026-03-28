import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import workOrderRoutes from './routes/workOrder.routes.js';
import vendorRoutes from './routes/vendor.routes.js';
import propertyRoutes from './routes/property.routes.js';
import spaceRoutes from './routes/space.routes.js';
import slaRoutes from './routes/sla.routes.js';
import recurringRoutes from './routes/recurring.routes.js';
import vendorMappingRoutes from './routes/vendorMapping.routes.js';

export function createApp() {
  const app = express();

  // CORS
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  app.use(cors({
    origin: frontendUrl,
    credentials: true,
  }));

  // Body parsing (10MB for base64 photos)
  app.use(express.json({ limit: '10mb' }));
  app.use(cookieParser());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/work-orders', workOrderRoutes);
  app.use('/api/vendors', vendorRoutes);
  app.use('/api/properties', propertyRoutes);
  app.use('/api/spaces', spaceRoutes);
  app.use('/api/sla', slaRoutes);
  app.use('/api/recurring-templates', recurringRoutes);
  app.use('/api/preferred-vendor-mappings', vendorMappingRoutes);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}
