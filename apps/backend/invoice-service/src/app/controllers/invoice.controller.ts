import { Request, Response } from 'express';
import { invoiceService } from '../services/invoice.service';
import { AuthPayload, isAdmin } from '@shared/auth';
import { logger } from '@shared/logger';

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export async function generateInvoiceAutomatically(req: AuthRequest, res: Response) {
  const { orderId } = req.params;

  if (!isAdmin(req.user)) return res.status(403).json({ error: 'Forbidden: Admins only' });

  try {
    const result = await invoiceService.generateInvoice(orderId);
    logger.info(`Invoice generated for order ${orderId}`, { result });

    return res.status(201).json({
      message: 'Invoice generated, uploaded successfully',
      cloudinaryUrl: result.cloudinaryUrl,
      minioUrl: result.minioUrl,
    });
  } catch (err: any) {
    logger.error(`Error generating invoice for order ${orderId}`, err);
    return res.status(500).json({ error: 'Failed to generate invoice', details: err.message || err });
  }
}

export async function downloadInvoice(req: AuthRequest, res: Response) {
  const { orderId } = req.params;
  const userId = req.user?.userId;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { streamUrl, filename } = await invoiceService.getInvoiceFile(orderId);

    // Stream PDF from MinIO to frontend
    const axios = await import('axios').then((mod) => mod.default);
    const response = await axios.get(streamUrl, { responseType: 'stream' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    response.data.pipe(res);

    logger.info(`Invoice ${orderId} downloaded by user ${userId}`);
  } catch (err: any) {
    logger.error(`Error downloading invoice ${orderId}`, err);
    return res.status(500).json({ error: 'Failed to download invoice', details: err.message || err });
  }
}
