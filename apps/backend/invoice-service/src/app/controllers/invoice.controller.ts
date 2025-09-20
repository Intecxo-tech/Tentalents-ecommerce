import { Request, Response } from 'express';
import { invoiceService } from '../services/invoice.service';
import { AuthPayload, isAdmin } from '@shared/auth';
import { logger } from '@shared/logger';
import axios from 'axios';

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
      minioUrl: result.minioUrl,
    });
  } catch (err: any) {
    logger.error(`Error generating invoice for order ${orderId}`, err);
    return res.status(500).json({ error: 'Failed to generate invoice', details: err.message || err });
  }
}

export async function downloadInvoice(req: AuthRequest, res: Response) {
  const { orderId } = req.params;

  try {
    const { filename, cloudinaryPreviewUrl, cloudinaryDownloadUrl, streamUrl } =
      await invoiceService.getInvoiceFile(orderId);

    // If preview mode requested
    if (req.query.preview === 'true') {
      return res.status(200).json({
        message: 'Invoice preview and download URLs',
        cloudinaryPreviewUrl,
        cloudinaryDownloadUrl,
        presignedUrl: streamUrl,
      });
    }

    // Instead of streaming binary, send a link
    return res.status(200).json({
      message: 'Invoice ready for download',
      downloadUrl: streamUrl,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch invoice', details: err.message });
  }
}
