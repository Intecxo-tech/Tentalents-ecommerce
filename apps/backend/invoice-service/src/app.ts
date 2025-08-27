// apps/invoice-service/src/app/app.ts
import express from 'express';
import { setupSwagger } from '@shared/swagger';
import { errorHandler, notFoundHandler } from '@shared/error';
import { corsMiddleware, helmetMiddleware } from '@shared/middlewares';
import { logger } from '@shared/logger';
import invoiceRoutes from './app/routes/invoice.routes';
import cloudinaryInvoiceRoutes from './app/routes/cloudinary-invoice.routes';

const app = express();

// 🧩 Global Middleware
app.use(express.json());
app.use(corsMiddleware);
app.use(helmetMiddleware);

// 📦 Routes
app.use('/api/invoices', invoiceRoutes); // Existing MinIO upload
app.use('/api/cloudinary-invoices', cloudinaryInvoiceRoutes); // ✅ Cloudinary upload

// 📚 Swagger Docs
setupSwagger(app, {
  title: 'Invoice Service',
  version: '1.0.0',
  path: '/api/docs/invoice',
});

// 🩺 Health Check
app.get('/healthz', (_req, res) => {
  logger.info('✅ Invoice Service health check passed');
  res.status(200).send('✅ Invoice Service healthy');
});

// 🚫 Not Found Handler
app.use(notFoundHandler);

// ❗ Global Error Handler
app.use(errorHandler);

// 🪵 Startup logs
logger.info('🧾 Invoice Service initialized');
logger.info('🚀 Cloudinary upload route ready at: POST /api/cloudinary-invoices');
logger.info('📜 Uploads will log: "✅ Invoice uploaded successfully: <URL>" in terminal');

export default app;



// import express from 'express';
// import { setupSwagger } from '@shared/swagger';
// import { errorHandler, notFoundHandler } from '@shared/error';
// import { corsMiddleware, helmetMiddleware } from '@shared/middlewares';
// import { logger } from '@shared/logger';
// import invoiceRoutes from './app/routes/invoice.routes';

// const app = express();

// // 🧩 Global Middleware
// app.use(express.json());
// app.use(corsMiddleware);
// app.use(helmetMiddleware);

// // 📦 Routes
// app.use('/api/invoices', invoiceRoutes);

// // 📚 Swagger Docs
// setupSwagger(app, {
//   title: 'Invoice Service',
//   version: '1.0.0',
//   path: '/api/docs/invoice',
// });

// // 🩺 Health Check
// app.get('/healthz', (_req, res) =>
//   res.status(200).send('✅ Invoice Service healthy')
// );

// // 🚫 Not Found Handler
// app.use(notFoundHandler);

// // ❗ Global Error Handler
// app.use(errorHandler);

// // 🪵 Startup log
// logger.info('🧾 Invoice Service initialized');

// export default app;
