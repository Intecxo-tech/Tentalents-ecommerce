import express from 'express';
import cors from 'cors';
import { setupSwagger } from '@shared/swagger';
import { errorHandler, notFoundHandler } from '@shared/error';
import { loggerMiddleware } from '@shared/logger';
import { VendorModule } from './app/vendor.module';

const app = express();

// ---------------- CORS ----------------
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ---------------- BODY PARSING ----------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ---------------- GLOBAL MIDDLEWARE ----------------
app.use(loggerMiddleware);

// ---------------- SWAGGER ----------------
setupSwagger(app, {
  title: 'Vendor Service',
  version: '1.0.0',
  path: '/api/docs/vendor',
});

// ---------------- HEALTH CHECK ----------------
app.get('/healthz', (_req, res) => res.status(200).send('✅ Vendor Service healthy'));

// ---------------- VENDOR MODULE ----------------
app.use('/api', VendorModule()); // Mount all vendor routes under /api/vendors

// ---------------- ERROR HANDLING ----------------
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
