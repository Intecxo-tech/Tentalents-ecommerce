// apps/vendor-service/src/app/services/vendor-cloudinary.service.ts
import { PrismaClient } from '../../../../../../generated/prisma';
import { uploadToCloudinary } from '@shared/auth';
import { logger } from '@shared/logger';

const prisma = new PrismaClient();

export const vendorCloudinaryService = {
  uploadProfileImage: async (vendorId: string, file: Express.Multer.File) => {
    if (!vendorId || !file) throw new Error('vendorId and file are required');

    // Upload image to Cloudinary in "vendor_profiles" folder
    const uploadedUrl = await uploadToCloudinary(
      file.buffer,
      'vendor_profiles',
      `vendor_${vendorId}`
    );

    // Save URL in vendor profile
    await prisma.vendor.update({
      where: { id: vendorId },
      data: { profileImage: uploadedUrl },
    });

    logger.info(`[VendorService] ✅ Uploaded Cloudinary image for vendor ${vendorId}`);
    return uploadedUrl;
  },
};
