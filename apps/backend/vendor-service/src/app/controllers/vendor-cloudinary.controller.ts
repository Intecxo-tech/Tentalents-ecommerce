// apps/vendor-service/src/app/controllers/vendor-cloudinary.controller.ts
import { Request, Response, NextFunction } from 'express';
import { vendorCloudinaryService } from '../services/vendor-cloudinary.service';
import { sendSuccess } from '@shared/utils';

export const updateVendorProfileImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vendorId = req.user?.userId; // JWT middleware must set req.user.userId
    if (!vendorId) return res.status(401).json({ error: 'Unauthorized: vendorId missing' });

    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No image file uploaded' });

    const uploadedUrl = await vendorCloudinaryService.uploadProfileImage(vendorId, file);

    return sendSuccess(res, 'Vendor profile image updated', { profileImage: uploadedUrl });
  } catch (err) {
    next(err);
  }
};
