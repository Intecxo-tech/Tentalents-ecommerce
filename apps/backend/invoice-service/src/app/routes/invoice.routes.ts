import { Router } from 'express';
import { generateInvoiceAutomatically, downloadInvoice } from '../controllers/invoice.controller';
import { authMiddleware } from '@shared/auth';
import { UserRole } from '@shared/types';

const router = Router();

// Admin-only route: generate invoice
router.post(
  '/generate/:orderId',
  authMiddleware([UserRole.ADMIN]), // ✅ Call once with roles
  generateInvoiceAutomatically
);

// Any authenticated user: download invoice
router.get(
  '/download/:invoiceId',
  authMiddleware(), // ✅ Call once without roles
  downloadInvoice
);

export default router;
