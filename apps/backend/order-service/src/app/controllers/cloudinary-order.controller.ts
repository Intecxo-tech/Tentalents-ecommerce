import { Request, Response } from 'express';
import { generateOrderInvoices } from '../helpers/order-invoice.helper';
import { logger } from '@shared/logger';

export class CloudinaryOrderController {
  /**
   * Generate vendor and user invoices for a given order.
   * Endpoint: POST /api/cloudinary-orders/:orderId
   */
  static async generateInvoice(req: Request, res: Response) {
    try {
      const orderId = req.params.orderId;
      const { vendorId, userId } = req.body;

      // ✅ Validate required parameters
      if (!orderId || !vendorId || !userId) {
        logger.warn('[CloudinaryOrderController] ❌ Missing required parameters');
        return res.status(400).json({
          success: false,
          message: 'orderId, vendorId, and userId are required',
        });
      }

      // 🔹 Use helper to generate invoices via Invoice Service
      const { vendorInvoiceUrl, userInvoiceUrl } = await generateOrderInvoices(
        orderId,
        vendorId,
        userId
      );

      logger.info(`[CloudinaryOrderController] ✅ Invoice generated for Order ID: ${orderId}`);

      return res.status(201).json({
        success: true,
        vendorInvoiceUrl,
        userInvoiceUrl,
      });
    } catch (err) {
      logger.error('[CloudinaryOrderController] ❌ Error generating invoice', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate invoice',
        error: err instanceof Error ? err.message : err,
      });
    }
  }
}
