import axios from 'axios';
import { logger } from '@shared/logger';

interface InvoiceResponse {
  vendorInvoiceUrl: string;
  userInvoiceUrl: string;
}

/**
 * Generate vendor and user invoices via Invoice Service
 * @param orderId - ID of the order
 * @param vendorId - ID of the vendor
 * @param userId - ID of the user
 * @returns { vendorInvoiceUrl, userInvoiceUrl }
 */
export const generateOrderInvoices = async (
  orderId: string,
  vendorId: string,
  userId: string
): Promise<InvoiceResponse> => {
  try {
    if (!orderId || !vendorId || !userId) {
      throw new Error('orderId, vendorId, and userId are required');
    }

    logger.info(`[OrderInvoiceHelper] Calling invoice-service for Order #${orderId}`);

    const response = await axios.post('http://localhost:3011/api/cloudinary-invoices', {
      orderId,
      vendorId,
      userId,
    });

    const { vendorInvoiceUrl, userInvoiceUrl } = response.data;

    if (!vendorInvoiceUrl || !userInvoiceUrl) {
      throw new Error('Invoice URLs not returned from invoice-service');
    }

    logger.info(`[OrderInvoiceHelper] ✅ Invoices received for Order #${orderId}`);
    return { vendorInvoiceUrl, userInvoiceUrl };
  } catch (err) {
    logger.error('[OrderInvoiceHelper] ❌ Failed to generate invoices via invoice-service', err);
    throw err;
  }
};
