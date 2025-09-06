import express from 'express';
import { setupSwagger } from '@shared/swagger';
import { errorHandler } from '@shared/error';
import { logger } from '@shared/logger';
import paymentRoutes from './app/routes/payment.routes';
import cors from 'cors';
import { raw } from 'express'; // ⚡ directly import raw parser

const app = express();

// Define rawBodyMiddleware locally
const rawBodyMiddleware = raw({ type: 'application/json' });

// Apply CORS middleware first
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

// Stripe webhook route with raw body parser
app.post('/api/payments/stripe/webhook', rawBodyMiddleware, paymentRoutes);

// Apply JSON parser for all other routes
app.use(express.json());

// Main payment routes
app.use('/api/payments', paymentRoutes);

// Swagger docs
setupSwagger(app, {
  title: 'Payment Service',
  version: '1.0.0',
  path: '/api/docs/payment',
  description: 'Handles payment processing, verification, and callbacks',
});

// Health check
app.get('/healthz', (_req, res) => {
  res.send('✅ Payment Service healthy');
});

// Centralized error handler
app.use(errorHandler);

logger.info('💳 Payment Service app initialized');

export default app;
