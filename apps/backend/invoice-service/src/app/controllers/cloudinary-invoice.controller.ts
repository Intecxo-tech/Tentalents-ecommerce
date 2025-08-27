import { Request, Response } from 'express';
import { CloudinaryInvoiceService } from '../services/cloudinary-invoice.service';
import { logger } from '@shared/logger';

export class CloudinaryInvoiceController {
  static async generateInvoice(req: Request, res: Response) {
    try {
      const invoiceData = req.body;

      // Generate both vendor and user invoices
      const { vendorInvoiceUrl, userInvoiceUrl } =
        await CloudinaryInvoiceService.generateVendorAndUserInvoices(invoiceData);

      logger.info('[cloudinary-invoice-controller] ✅ Vendor and User invoices generated');

      return res.status(201).json({
        success: true,
        vendorInvoiceUrl,
        userInvoiceUrl,
      });
    } catch (error) {
      logger.error('[cloudinary-invoice-controller] ❌ Failed to generate invoice:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate invoice',
        error: error instanceof Error ? error.message : error,
      });
    }
  }
}
