// apps/vendor-service/src/app/app.ts
import express from 'express';
import cors from 'cors';
import { setupSwagger } from '@shared/swagger';
import { errorHandler, notFoundHandler } from '@shared/error';
import { loggerMiddleware, logger } from '@shared/logger';
import { authMiddleware } from '@shared/auth';
import vendorRoutes from './app/routes/vendor.routes';
import cloudinaryVendorRoutes from './app/routes/cloudinary-vendor.routes';

const app = express();

// 🔐 Core Middleware
app.use(express.json());

// 🛑 Enable CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 🌐 Logger Middleware
app.use(loggerMiddleware);

// 📚 Swagger API Docs
setupSwagger(app, {
  title: 'Vendor Service',
  version: '1.0.0',
  path: '/api/docs/vendor',
});

// 🩺 Health Check Endpoint (public)
app.get('/healthz', (_req, res) => {
  logger.info('✅ Vendor Service health check passed');
  return res.status(200).send('✅ Vendor Service healthy');
});

// 🔐 Auth Middleware (protect all routes below)
app.use(authMiddleware());

// 🛣️ Service Routes
app.use('/api/vendor', vendorRoutes);
app.use('/api/cloudinary-vendor', cloudinaryVendorRoutes); // ✅ Cloudinary vendor uploads

// 🚫 Not Found Handler
app.use(notFoundHandler);

// ❌ Global Error Handler
app.use(errorHandler);

// 🪵 Startup logs
logger.info('🏢 Vendor Service initialized');
logger.info('🚀 Cloudinary vendor route ready at: POST /api/cloudinary-vendor');

export default app;
