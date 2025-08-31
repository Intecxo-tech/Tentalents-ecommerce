import { Router } from 'express';
import { generateInvoiceAutomatically, getInvoiceDownloadUrl } from '../controllers/invoice.controller';
import { requireAuth, ROLES } from '@shared/auth';

const router = Router();

// Generate invoices for a specific order (restricted to admin/super-admin)
router.post(
  '/generate/:orderId',
  requireAuth([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  generateInvoiceAutomatically
);

// Get download URL for a specific invoice (buyer/admin)
router.get(
  '/download/:invoiceId',
  requireAuth([ROLES.BUYER, ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  getInvoiceDownloadUrl
);

export default router;
