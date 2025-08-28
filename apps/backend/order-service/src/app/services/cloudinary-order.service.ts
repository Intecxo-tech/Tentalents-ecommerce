// apps/order-service/src/app/services/cloudinary-order.service.ts
import axios from 'axios';
import { logger } from '@shared/logger';

export class CloudinaryOrderService {
  /**
   * Generate Vendor and User invoices for a given order
   * by calling the Invoice Service HTTP endpoint.
   * @param orderId - ID of the order
   * @param vendorId - ID of the vendor
   * @param userId - ID of the user
   * @returns { vendorInvoiceUrl, userInvoiceUrl }
   */
  static async generateInvoice(orderId: string, vendorId: string, userId: string) {
    try {
      if (!orderId || !vendorId || !userId) {
        throw new Error('orderId, vendorId, and userId are required');
      }

      logger.info(`[CloudinaryOrderService] Calling invoice-service for Order #${orderId}`);

      // Call Invoice Service endpoint
      const response = await axios.post('http://localhost:3011/api/cloudinary-invoices', {
        orderId,
        vendorId,
        userId,
      });

      const { vendorInvoiceUrl, userInvoiceUrl } = response.data;

      if (!vendorInvoiceUrl || !userInvoiceUrl) {
        throw new Error('Invoice URLs not returned from invoice-service');
      }

      logger.info(`[CloudinaryOrderService] ✅ Invoices received for Order #${orderId}`);
      return { vendorInvoiceUrl, userInvoiceUrl };
    } catch (err) {
      logger.error('[CloudinaryOrderService] ❌ Failed to generate invoices via invoice-service', err);
      throw err;
    }
  }
}
