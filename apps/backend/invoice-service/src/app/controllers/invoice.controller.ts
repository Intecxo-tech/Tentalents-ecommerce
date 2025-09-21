import { Request, Response } from 'express';
import { invoiceService } from '../services/invoice.service';
import { AuthPayload, isAdmin } from '@shared/auth';
import { logger } from '@shared/logger';

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export async function generateInvoiceAutomatically(req: AuthRequest, res: Response) {
  const { orderId } = req.params;

  if (!isAdmin(req.user)) {
    return res.status(403).json({ error: 'Forbidden: Admins only' });
  }

  try {
    const result = await invoiceService.generateInvoice(orderId);
    return res.status(201).json({
      message: 'Invoice generated and uploaded successfully',
      cloudinaryUrl: result.cloudinaryUrl,
      minioUrl: result.minioUrl, // presigned URL
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
    // Get signed URL from service
    const { signedUrl, filename, cloudinaryUrl } = await invoiceService.getInvoiceFile(orderId);

    if (req.query.preview === 'true') {
      // Return URLs for frontend preview
      return res.status(200).json({
        message: 'Invoice URLs',
        cloudinaryUrl,
        signedUrl, // frontend expects `signedUrl`
      });
    }

    // For direct download
    const response = await fetch(signedUrl);
    if (!response.ok) throw new Error('Failed to fetch invoice file');

    const buffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(Buffer.from(buffer));
  } catch (err: any) {
    logger.error(`Error downloading invoice ${orderId}`, err);
    return res.status(500).json({ error: 'Failed to download invoice', details: err.message || err });
  }
}
