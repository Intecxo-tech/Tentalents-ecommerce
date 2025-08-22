import { Request, Response } from 'express';
import { uploadToCloudinary } from '@shared/auth';
import { logger } from '@shared/logger';

export const uploadInvoiceController = async (req: Request, res: Response) => {
  try {
    const { file } = req.body; // expecting base64 string

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Convert base64 to Buffer
    const base64Data = file.replace(/^data:.*;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload to Cloudinary under 'invoices' folder
    const url = await uploadToCloudinary(buffer, 'invoices');

    res.status(200).json({ url });
  } catch (err: any) {
    logger.error('Cloudinary upload failed:', err);
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
};
