import express from 'express';

import { setupSwagger } from '@shared/swagger';
import { errorHandler, notFoundHandler } from '@shared/error';
import { loggerMiddleware } from '@shared/logger';
import { authMiddleware } from '@shared/auth';

import vendorRoutes from './app/routes/vendor.routes';
import oauthRoutes from './app/routes/oauth.routes';

const app = express();

// 🌐 Global Middlewares
app.use(express.json());
app.use(loggerMiddleware);

// 📚 Swagger API Documentation
setupSwagger(app, {
  title: 'Vendor Service',
  version: '1.0.0',
  path: '/api/docs/vendor',
});

// 🩺 Health Check
app.get('/healthz', (_req, res) => {
  res.status(200).send('✅ Vendor Service healthy');
});

// 🔓 Public Routes
app.use('/api/oauth', oauthRoutes);

// 🔐 Protected Routes
app.use(authMiddleware()); // Firebase token required
app.use('/api/vendor', vendorRoutes);

// 🚫 Not Found
app.use(notFoundHandler);

// ❌ Error Handler
app.use(errorHandler);

export default app;
