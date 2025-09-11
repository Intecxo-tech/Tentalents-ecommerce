import { Router } from 'express';
import { generateInvoiceAutomatically, downloadInvoice } from '../controllers/invoice.controller';
import { authMiddleware } from '@shared/auth';
import { UserRole } from '@shared/types';

const router = Router();

/**
 * @route POST /invoice/generate/:orderId
 * @desc Generate invoice automatically for an order
 * @access Admin only
 */
router.post(
  '/generate/:orderId',
  authMiddleware([UserRole.ADMIN]),
  generateInvoiceAutomatically
);

/**
 * @route GET /invoice/download/:orderId
 * @desc Download invoice PDF for an order
 * @access Authenticated users
 */
router.get(
  '/download/:orderId',
  authMiddleware(),
  downloadInvoice
);

export default router;
