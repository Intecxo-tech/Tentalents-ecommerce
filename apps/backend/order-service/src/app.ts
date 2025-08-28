import express from 'express';
import cors from 'cors';
import { setupSwagger } from '@shared/swagger';
import { errorHandler, notFoundHandler } from '@shared/error';
import orderRoutes from './app/routes/order.routes';
import cloudinaryOrderRoutes from './app/routes/cloudinary-order.routes';
import { logger } from '@shared/logger';

export * from './app/services/order.service';

const app = express();

// 🔐 Core Middleware
app.use(express.json());

// 🛑 Enable CORS
app.use(
  cors({
    origin: 'http://localhost:3000', // adjust frontend URL if needed
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// 🛒 Routes
app.use('/api/orders', orderRoutes);
app.use('/api/cloudinary-orders', cloudinaryOrderRoutes); // ✅ Cloudinary invoice endpoints

// 📚 Swagger API Docs
setupSwagger(app, {
  title: 'Order Service',
  version: '1.0.0',
  path: '/api/docs/order',
});

// ❤️ Health Check
app.get('/healthz', (_req, res) => {
  logger.info('✅ Order Service health check passed');
  res.status(200).send('✅ Order Service healthy');
});

// 🚫 Not Found Handler
app.use(notFoundHandler);

// ❌ Global Error Handler
app.use(errorHandler);

// 🪵 Startup logs
logger.info('🛒 Order Service initialized');
logger.info('🚀 Cloudinary order route ready at: POST /api/cloudinary-orders/:orderId');

export default app;
