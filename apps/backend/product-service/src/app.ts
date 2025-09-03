import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { setupSwagger } from '@shared/swagger';
import { errorHandler } from '@shared/error';
import productRoutes from './app/routes/product.routes';

const app = express();

// 🛡️ Security & Middleware
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '50mb' })); // ⬅️ The change is here!
app.use(express.urlencoded({ limit: '50mb', extended: true })); // ⬅️ Add this too for good measure

// 📦 Product Routes
app.use('/api/products', productRoutes); // pluralized for REST convention

// 📚 Swagger API Documentation
setupSwagger(app, {
  title: 'Product Service',
  version: '1.0.0',
  path: '/api/docs/product',
});

// 💓 Health Check
app.get('/healthz', (_req, res) => {
  return res.status(200).send('✅ Product Service healthy');
});

// ❌ Global Error Handler
app.use(errorHandler);

export default app;