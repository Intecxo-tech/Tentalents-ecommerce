import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { setupSwagger } from '@shared/swagger';
import { errorHandler } from '@shared/error';
import { logger } from '@shared/logger';

import authRoutes from './app/routes/auth.routes';
import userRoutes from './app/routes/user.routes';

const app = express();

// 🛡️ Global Middlewares
app.use(helmet()); // Set security-related headers
app.use(express.json()); // Parse JSON request bodies
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true, // if using cookies/session
}));

// 📚 Swagger API Documentation
setupSwagger(app, {
  title: 'User Service',
  version: '1.0.0',
  path: '/api/docs/user',
});

// 📦 Feature Routes
app.use('/api/auth', authRoutes); // 🔐 Auth: login, register, token, etc.
// ✅ Use plural 'users' to match route definitions
app.use('/api/users', userRoutes); // 👤 User: profile, roles, addresses, etc.

// 🩺 Health Check Endpoint
app.get('/healthz', (_req, res) => {
  logger.info('✅ Health check: User Service is up');
  return res.status(200).send('✅ User Service healthy');
});

// ❌ Centralized Error Handler
app.use(errorHandler);

export default app;
