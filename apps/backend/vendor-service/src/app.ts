import express from 'express';
import { setupSwagger } from '@shared/swagger';
import { errorHandler, notFoundHandler } from '@shared/error';
import { loggerMiddleware } from '@shared/logger';
import { authMiddleware } from '@shared/auth';
import vendorRoutes from './app/routes/vendor.routes';
import vendorCloudinaryRoutes from './app/routes/vendor-cloudinary.routes';
import cors from 'cors';

const app = express();

// 🌐 CORS Middleware
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 🧩 JSON Parser Middleware
app.use(express.json());

// 🪵 Logger Middleware
app.use(loggerMiddleware);

// 📚 Swagger API Docs (public)
setupSwagger(app, {
  title: 'Vendor Service',
  version: '1.0.0',
  path: '/api/docs/vendor',
});

// 🩺 Health Check Endpoint (public)
app.get('/healthz', (_req, res) => {
  return res.status(200).send('✅ Vendor Service healthy');
});

// 🔐 Auth Middleware (protect routes below)
const authenticateJWT = authMiddleware();

// 🛣️ Vendor Routes (protected)
app.use('/api/vendor', authenticateJWT, vendorRoutes);

// 🛣️ Cloudinary Routes (protected, for vendor profile image upload)
app.use('/api/vendor/cloudinary', authenticateJWT, vendorCloudinaryRoutes);

// 🚫 404 Handler
app.use(notFoundHandler);

// ❌ Centralized Error Handler
app.use(errorHandler);

export default app;
