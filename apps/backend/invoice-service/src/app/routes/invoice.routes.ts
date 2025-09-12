import { Router } from 'express';
import {
  generateInvoiceAutomatically,
  downloadInvoice,
} from '../controllers/invoice.controller';
import { authMiddleware } from '@shared/auth';
import { UserRole } from '@shared/types';

const router = Router();

/**
 * Generate invoice automatically for an order
 * POST /api/invoices/generate/:orderId
 * Access: Admin only
 */
router.post(
  '/generate/:orderId',
  authMiddleware([UserRole.ADMIN]),
  generateInvoiceAutomatically
);

/**
 * Download invoice PDF for an order
 * GET /api/invoices/download/:orderId
 * Access: Authenticated users
 */
router.get(
  '/download/:orderId',
  authMiddleware(),
  downloadInvoice
);

export default router;
