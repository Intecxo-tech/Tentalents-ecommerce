import express from 'express';
import { setupSwagger } from '@shared/swagger';
import { errorHandler, notFoundHandler } from '@shared/error';
import { corsMiddleware, helmetMiddleware } from '@shared/middlewares';
import { logger } from '@shared/logger';
import invoiceRoutes from './app/routes/invoice.routes';
import cloudinaryRoutes from './app/routes/cloudinary.routes';

const app = express();

// 🧩 Global Middleware
app.use(express.json());
app.use(corsMiddleware);
app.use(helmetMiddleware);

// 📦 Routes
app.use('/api/invoices', invoiceRoutes);

// 🌐 Cloudinary routes (demo: logs URL in console)
app.use('/api/cloudinary', cloudinaryRoutes);

// 📚 Swagger Docs
setupSwagger(app, {
  title: 'Invoice Service',
  version: '1.0.0',
  path: '/api/docs/invoice',
});

// 🩺 Health Check
app.get('/healthz', (_req, res) =>
  res.status(200).send('✅ Invoice Service healthy')
);

// 🚫 Not Found Handler
app.use(notFoundHandler);

// ❗ Global Error Handler
app.use(errorHandler);

// 🪵 Startup log
logger.info('🧾 Invoice Service initialized');

export default app;
