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

  // CORS — allow any localhost port in dev
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (same-origin, curl, etc.)
      if (!origin) return callback(null, true);
      // Allow any localhost port in dev
      if (origin.match(/^http:\/\/localhost:\d+$/)) return callback(null, true);
      // Allow configured frontend URL
      if (origin === frontendUrl) return callback(null, true);
      callback(null, false);
    },
    credentials: true,
  }));

  // Body parsing (10MB for base64 photos)
  app.use(express.json({ limit: '10mb' }));
  app.use(cookieParser());

  // Root redirect → login
  app.get('/', (_req, res) => {
    res.redirect('/login');
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API index — HTML landing page
  app.get('/api', (_req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Casa CRE API</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .container { max-width: 680px; width: 100%; padding: 2rem; }
    .header { text-align: center; margin-bottom: 2.5rem; }
    .header h1 { font-size: 2.25rem; font-weight: 700; color: #f8fafc; margin-bottom: 0.5rem; }
    .header .badge { display: inline-block; background: #22c55e; color: #052e16; font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.75rem; border-radius: 9999px; margin-bottom: 1rem; }
    .header p { color: #94a3b8; font-size: 0.95rem; }
    .section { background: #1e293b; border: 1px solid #334155; border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 1rem; }
    .section h2 { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 0.75rem; }
    .endpoint { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0; font-size: 0.875rem; }
    .method { font-weight: 600; font-size: 0.7rem; padding: 0.15rem 0.4rem; border-radius: 0.25rem; min-width: 3rem; text-align: center; }
    .get { background: #1d4ed8; color: #dbeafe; }
    .post { background: #16a34a; color: #dcfce7; }
    .patch { background: #d97706; color: #fef3c7; }
    .path { color: #cbd5e1; font-family: 'Cascadia Code', 'Fira Code', monospace; }
    .desc { color: #64748b; margin-left: auto; font-size: 0.8rem; }
    .footer { text-align: center; margin-top: 1.5rem; color: #475569; font-size: 0.8rem; }
    a { color: #60a5fa; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">RUNNING</div>
      <h1>Casa CRE API</h1>
      <p>CRE Operations Platform &mdash; v1.0.0</p>
    </div>

    <div class="section">
      <h2>Authentication</h2>
      <div class="endpoint"><span class="method post">POST</span> <span class="path">/api/auth/login</span> <span class="desc">Login</span></div>
      <div class="endpoint"><span class="method post">POST</span> <span class="path">/api/auth/logout</span> <span class="desc">Logout</span></div>
      <div class="endpoint"><span class="method get">GET</span> <span class="path">/api/auth/me</span> <span class="desc">Current user</span></div>
    </div>

    <div class="section">
      <h2>Work Orders</h2>
      <div class="endpoint"><span class="method get">GET</span> <span class="path">/api/work-orders</span> <span class="desc">List (filtered)</span></div>
      <div class="endpoint"><span class="method get">GET</span> <span class="path">/api/work-orders/:id</span> <span class="desc">Detail + photos</span></div>
      <div class="endpoint"><span class="method post">POST</span> <span class="path">/api/work-orders</span> <span class="desc">Create</span></div>
      <div class="endpoint"><span class="method patch">PATCH</span> <span class="path">/api/work-orders/:id</span> <span class="desc">Transition</span></div>
      <div class="endpoint"><span class="method post">POST</span> <span class="path">/api/work-orders/:id/photos</span> <span class="desc">Upload photo</span></div>
    </div>

    <div class="section">
      <h2>Resources</h2>
      <div class="endpoint"><span class="method get">GET</span> <span class="path">/api/vendors</span> <span class="desc">Vendors + scores</span></div>
      <div class="endpoint"><span class="method get">GET</span> <span class="path">/api/properties</span> <span class="desc">Properties + spaces</span></div>
      <div class="endpoint"><span class="method get">GET</span> <span class="path">/api/spaces</span> <span class="desc">Spaces by property</span></div>
    </div>

    <div class="section">
      <h2>Analytics &amp; SLA</h2>
      <div class="endpoint"><span class="method get">GET</span> <span class="path">/api/sla/compliance</span> <span class="desc">SLA metrics</span></div>
      <div class="endpoint"><span class="method get">GET</span> <span class="path">/api/sla/analytics</span> <span class="desc">Portfolio analytics</span></div>
    </div>

    <div class="section">
      <h2>Maintenance</h2>
      <div class="endpoint"><span class="method get">GET</span> <span class="path">/api/recurring-templates</span> <span class="desc">PM schedules</span></div>
      <div class="endpoint"><span class="method get">GET</span> <span class="path">/api/preferred-vendor-mappings</span> <span class="desc">Vendor assignments</span></div>
    </div>

    <div class="footer">
      <a href="/api/health">Health Check</a> &nbsp;&middot;&nbsp;
      Frontend: <a href="${frontendUrl}">${frontendUrl}</a>
    </div>
  </div>
</body>
</html>`);
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
