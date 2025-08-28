// apps/user-service/src/app/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { setupSwagger } from '@shared/swagger';
import { errorHandler, notFoundHandler } from '@shared/error';
import { logger } from '@shared/logger';

import authRoutes from './app/routes/auth.routes';
import userRoutes from './app/routes/user.routes';
import cloudinaryUserRoutes from './app/routes/cloudinary-user.routes'; // ✅ Cloudinary uploads

const app = express();

// 🛡️ Global Middleware
app.use(helmet()); // Security headers
app.use(express.json()); // Parse JSON
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 📚 Swagger API Documentation
setupSwagger(app, {
  title: 'User Service',
  version: '1.0.0',
  path: '/api/docs/user',
});

// 🛣️ Routes
app.use('/api/auth', authRoutes); // 🔐 Auth
app.use('/api/user', userRoutes); // 👤 User
app.use('/api/cloudinary-user', cloudinaryUserRoutes); // ✅ Cloudinary user uploads

// 🩺 Health Check Endpoint (public)
app.get('/healthz', (_req, res) => {
  logger.info('✅ User Service health check passed');
  return res.status(200).send('✅ User Service healthy');
});

// 🚫 Not Found Handler
app.use(notFoundHandler);

// ❌ Global Error Handler
app.use(errorHandler);

// 🪵 Startup log
logger.info('👤 User Service initialized');
logger.info('🚀 Cloudinary user route ready at: POST /api/cloudinary-user');

export default app;
