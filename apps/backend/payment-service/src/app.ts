import express from 'express';
import { setupSwagger } from '@shared/swagger';
import { errorHandler } from '@shared/error';
import { logger } from '@shared/logger';
import paymentRoutes from './app/routes/payment.routes';
import cors from 'cors';
import {rawBodyMiddleware} from '@shared/middlewares';
const app = express();

// Apply CORS middleware first
app.use(cors({
  origin: 'http://localhost:3000', // your frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

// Then apply JSON body parser
// ⚠️ Mount only the webhook first with raw body

app.post('/api/payments/stripe/webhook', rawBodyMiddleware, paymentRoutes);
app.use(express.json());

// Now apply your routes
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
