import express from 'express';
import { setupSwagger } from '@shared/swagger';
import { errorHandler, notFoundHandler } from '@shared/error';
import { loggerMiddleware } from '@shared/logger';
import { authMiddleware } from '@shared/auth';
import vendorRoutes from './app/routes/vendor.routes';
import cors from 'cors'; 


const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 🌐 Global Middleware



app.use(loggerMiddleware);
// 📚 Swagger API Docs (public, before auth middleware)
setupSwagger(app, {
  title: 'Vendor Service',
  version: '1.0.0',
  path: '/api/docs/vendor',
});

// 🩺 Health Check Endpoint (public, no auth required)
app.get('/healthz', (_req, res) => {
  return res.status(200).send('✅ Vendor Service healthy');
});

// 🔐 Auth Middleware (protect all routes below)
// app.use(authMiddleware());

// 🛣️ Service Routes
app.use('/api/vendors', vendorRoutes);

// 🚫 404 Handler
app.use(notFoundHandler);

// ❌ Centralized Error Handler
app.use(errorHandler);

export default app;
