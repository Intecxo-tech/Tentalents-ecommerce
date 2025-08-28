import { Router } from 'express';
import { CloudinaryOrderController } from '../controllers/cloudinary-order.controller';

const router = Router();

/**
 * @route   POST /api/cloudinary-orders/:orderId
 * @desc    Generate vendor and user invoices for the given order
 *          Internally, the controller now uses `order-invoice.helper.ts`
 * @body    { vendorId: string, userId: string }
 * @returns { vendorInvoiceUrl: string, userInvoiceUrl: string }
 */
router.post('/:orderId', CloudinaryOrderController.generateInvoice);

export default router;
