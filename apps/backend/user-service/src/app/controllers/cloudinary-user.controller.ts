import { Request, Response } from 'express';
import { CloudinaryUserService } from '../services/cloudinary-user.service';
import { logger } from '@shared/logger';

export class CloudinaryUserController {
  static async getUserInvoices(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const invoices = await CloudinaryUserService.getUserInvoices(userId);
      res.status(200).json({ success: true, invoices });
    } catch (err) {
      logger.error('[cloudinary-user-controller] ❌ Error fetching invoices', err);
      res.status(500).json({ success: false, message: 'Failed to fetch invoices' });
    }
  }
}
