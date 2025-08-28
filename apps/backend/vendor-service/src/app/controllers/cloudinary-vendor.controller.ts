import { Request, Response } from 'express';
import { CloudinaryVendorService } from '../services/cloudinary-vendor.service';
import { logger } from '@shared/logger';

export class CloudinaryVendorController {
  static async getVendorInvoices(req: Request, res: Response) {
    try {
      const vendorId = req.params.vendorId;
      const invoices = await CloudinaryVendorService.getVendorInvoices(vendorId);
      res.status(200).json({ success: true, invoices });
    } catch (err) {
      logger.error('[cloudinary-vendor-controller] ❌ Error fetching invoices', err);
      res.status(500).json({ success: false, message: 'Failed to fetch invoices' });
    }
  }
}
