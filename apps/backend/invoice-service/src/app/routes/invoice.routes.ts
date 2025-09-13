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
 * - Admin triggers invoice generation
 * - Generates PDF, uploads to MinIO & Cloudinary
 * - Stores invoice in DB and emails buyer
 */
router.post(
  '/generate/:orderId',
  authMiddleware([UserRole.ADMIN]), // only admin can generate
  generateInvoiceAutomatically
);

/**
 * Download invoice PDF for an order
 * GET /api/invoices/download/:orderId
 * Access: Buyer or Admin
 * - Buyers can only download their own invoices
 * - Admin can download any invoice
 * - Streams PDF from MinIO, or fallback to Cloudinary
 */
router.get(
  '/download/:orderId',
  authMiddleware(), // any authenticated user
  downloadInvoice
);

export default router;
