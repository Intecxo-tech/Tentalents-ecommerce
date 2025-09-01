// apps/vendor-service/src/app/vendor.module.ts
import { Router } from 'express';
import vendorRoutes from './routes/vendor.routes';

export const VendorModule = (): Router => {
  const router = Router();

  // All vendor-related routes prefixed with /vendors
  router.use('/vendors', vendorRoutes);

  return router;
};
