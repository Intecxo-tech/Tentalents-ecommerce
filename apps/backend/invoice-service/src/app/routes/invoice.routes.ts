import { Router } from 'express';
import { generateInvoiceAutomatically, downloadInvoice } from '../controllers/invoice.controller';
import { authMiddleware } from '@shared/auth';

const router = Router();

/**
 * 🧾 POST /api/invoices/:orderId/generate
 * Admin-only: Generate invoice for a given order
 * Frontend button can call this endpoint
 */
router.post(
  '/:orderId/generate',
  authMiddleware(['admin']), // Only admins can access
  generateInvoiceAutomatically
);

/**
 * 📄 GET /api/invoices/:orderId/download
 * Admin or Buyer: Download invoice PDF
 * Frontend button can call this endpoint
 */
router.get(
  '/:orderId/download',
  authMiddleware(['admin', 'buyer']), // Admins or buyers can access
  downloadInvoice
);

export default router;
