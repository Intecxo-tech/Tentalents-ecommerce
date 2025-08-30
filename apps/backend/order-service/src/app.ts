import express from 'express';
import cors from 'cors';
import orderRoutes from './app/routes/order.routes';
import { setupSwagger } from '@shared/swagger';
import { errorHandler } from '@shared/error';
import { processOrder } from './app/process-order';

const app = express();

// 🔐 Core Middleware
app.use(express.json());

// 🛑 CORS Middleware
app.use(
  cors({
    origin: 'http://localhost:3000', // adjust for your frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 🛒 Order Routes
app.use('/api/orders', orderRoutes);

// ❌ Health Check
app.get('/healthz', (_req, res) => res.send('✅ Order Service healthy'));

// ❌ Global Error Handler
app.use(errorHandler);

// ❌ Process Order Endpoint
app.post('/api/orders/:orderId/process', async (req, res) => {
  const { orderId } = req.params;
  try {
    const result = await processOrder(orderId);
    res.json(result);
  } catch (err: any) {
    console.error('Error processing order:', err);
    res.status(500).json({ error: err.message });
  }
});

// 📚 Swagger Docs
setupSwagger(app, {
  title: 'Order Service',
  version: '1.0.0',
  path: '/api/docs/order',
});

export default app;
