import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { setupSwagger } from '@shared/swagger';
import { errorHandler } from '@shared/error';
import { loggerMiddleware } from '@shared/logger';

import oauthRoutes from './app/routes/oauth.routes'; // 🔐 Google OAuth (Firebase)
import userRoutes from './app/routes/user.routes';   // 👤 User routes

const app = express();

// 🌐 Global Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(loggerMiddleware); // Logs each request

// 📚 Swagger API Docs (should be public and before any auth middleware)
setupSwagger(app, {
  title: 'User Service',
  version: '1.0.0',
  path: '/api/docs/user',
});

// 🩺 Health Check Endpoint
app.get('/healthz', (_req, res) => {
  res.status(200).send('✅ User Service healthy');
});

// 🔓 Public Routes
app.use('/api/oauth', oauthRoutes); // Firebase Google login route
app.use('/api/user', userRoutes);   // User-related endpoints

// ❌ Global Error Handler (should come last)
app.use(errorHandler);

export default app;
