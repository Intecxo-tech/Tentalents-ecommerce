import express from 'express';
import { setupSwagger } from '@shared/swagger';
import { errorHandler } from '@shared/error';
import orderRoutes from './app/routes/order.routes';
import cors from 'cors';  // <-- Import CORS middleware
export * from './app/services/order.service';
const app = express();

// 🔐 Core Middleware
app.use(express.json());

// 🛑 Enable CORS middleware (important to allow cross-origin requests)
app.use(cors({
  origin: 'http://localhost:3000',  // Frontend URL (adjust if necessary)
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow necessary methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow necessary headers
}));

// 🛒 Order Routes
app.use('/api/orders', orderRoutes);

// 📚 Swagger API Docs
setupSwagger(app, {
  title: 'Order Service',
  version: '1.0.0',
  path: '/api/docs/order',
});

// ❤️ Health Check Endpoint
app.get('/healthz', (_req, res) => res.send('✅ Order Service healthy'));

// ❌ Global Error Handler (custom error handling middleware)
app.use(errorHandler);

export default app;