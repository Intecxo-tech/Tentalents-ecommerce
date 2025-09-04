import express, { Request, Response } from 'express';
import { setupSwagger } from '@shared/swagger';
import { errorHandler } from '@shared/error';
import { logger } from '@shared/logger';
import paymentRoutes from './app/routes/payment.routes';
import cors from 'cors';
import Stripe from 'stripe';

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-07-30.basil', // match the typed literal
});

// Apply CORS middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

// Skip JSON parsing for Stripe webhook
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payments/stripe/webhook') {
    next(); // skip JSON parser
  } else {
    express.json()(req, res, next);
  }
});

// Stripe webhook route
app.post('/api/payments/stripe/webhook', (req: Request, res: Response) => {
  let rawBody = '';

  req.on('data', (chunk) => {
    rawBody += chunk;
  });

  req.on('end', async () => {
    try {
      const signature = req.headers['stripe-signature'] as string;
      const event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );

      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          logger.info('💰 Payment succeeded', event.data.object);
          break;
        case 'payment_intent.payment_failed':
          logger.warn('❌ Payment failed', event.data.object);
          break;
        default:
          logger.info('ℹ️ Unhandled Stripe event', event.type);
      }

      res.status(200).send({ received: true });
    } catch (err: any) {
      logger.error('Webhook signature verification failed.', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  });
});

// Normal payment routes
app.use('/api/payments', express.json(), paymentRoutes);

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
