// apps/invoice-service/src/app/controllers/cloudinary-invoice.controller.ts
import { Request, Response } from 'express';
import { CloudinaryInvoiceService } from '../services/cloudinary-invoice.service';
import { logger } from '@shared/logger';

export class CloudinaryInvoiceController {
  static async generateInvoice(req: Request, res: Response) {
    try {
      const invoiceUrl = await CloudinaryInvoiceService.generateAndUploadInvoice(req.body);
      return res.status(201).json({ success: true, url: invoiceUrl });
    } catch (error) {
      logger.error('[cloudinary-invoice-controller] ❌ Failed to generate invoice:', error);
      return res.status(500).json({ success: false, message: 'Failed to generate invoice' });
    }
  }
}
