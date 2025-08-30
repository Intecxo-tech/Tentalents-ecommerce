import { Request, Response,NextFunction } from 'express';
import { createVendorDtoToPrisma } from '../dto/vendor.dto';
import {
  PrismaClient,
  VendorStatus as PrismaVendorStatus,
} from '@prisma/client';
import { logger } from '@shared/logger';
import { uploadFileToMinIO } from '@shared/minio';
import {
  CreateVendorSchema,
  UpdateVendorSchema,
  UpdateVendorStatusSchema,
} from '../schemas/vendor.schema';
import { vendorService } from '../services/vendor-service';

import jwt from 'jsonwebtoken';
import type { UserRole } from '@shared/types';
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
    vendorId?: string;
  };
}
import type {
  CreateVendorDto,
  UpdateVendorDto,
  UpdateVendorStatusDto,
} from '../dto/vendor.dto';

import { VendorStatus as SharedVendorStatus } from '@shared/types';
import { produceKafkaEvent } from '@shared/kafka';
import { KAFKA_TOPICS } from '@shared/kafka';

const prisma = new PrismaClient();

function toPrismaStatus(status: SharedVendorStatus): PrismaVendorStatus {
  return status.toLowerCase() as PrismaVendorStatus;
}
/**
 * Step 1: Initiate OTP for vendor registration
 */
export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedRequest['user'];
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
export const initiateVendorRegistrationOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const result = await vendorService.initiateVendorRegistrationOtp(email);
    return res.status(200).json(result);
  } catch (err) {
    logger.error('Error initiating vendor OTP', err);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
};

/**
 * Step 2: Verify vendor email OTP
 */
export const verifyVendorEmailOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const result = await vendorService.verifyVendorEmailOtp(email, otp);
    return res.status(200).json(result);
  } catch (err) {
    logger.error('Error verifying vendor OTP', err);
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }
};

/**
 * Step 3: Complete vendor user registration
 */
export const completeVendorUserRegistration = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

   const result = await vendorService.completeVendorUserRegistration(email, password);
return res.status(201).json(result);
  } catch (err) {
    logger.error('Error completing vendor user registration', err);
    return res.status(500).json({ error: 'Failed to register vendor user' });
  }
};
export const getVendorProfileByVendorId = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;

    if (!vendorId) {
      return res.status(400).json({ error: 'Vendor ID is required' });
    }

    console.log(`[Controller] Fetching profile for vendorId: ${vendorId}`);

    // Fetch vendor details from the service
    const vendor = await vendorService.getByVendorId(vendorId);

    // Log the full vendor details returned from the service
    console.log(`[Controller] Fetched Vendor Profile: `, vendor);

    // Log the individual fields to make sure you're capturing everything
    console.log(`[Controller] Vendor ID: ${vendor.id}`);
    console.log(`[Controller] Vendor Email: ${vendor.email}`);
    console.log(`[Controller] Vendor Name: ${vendor.name}`);
    console.log(`[Controller] Vendor Phone: ${vendor.phone}`);
    console.log(`[Controller] Vendor Business Name: ${vendor.businessName}`);
    console.log(`[Controller] Vendor Status: ${vendor.status}`);
    console.log(`[Controller] Vendor Created At: ${vendor.createdAt}`);
    console.log(`[Controller] Vendor Updated At: ${vendor.updatedAt}`);
    console.log(`[Controller] User Details: `, vendor.user);
    console.log(`[Controller] Bank Details: `, vendor.bankDetails);

    return res.status(200).json({ vendor });
  } catch (err) {
    logger.error('Error fetching vendor profile by vendor ID', err);
    return res.status(500).json({ error: 'Failed to fetch vendor profile' });
  }
};

export const updateVendorProfile = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;

  try {
    const vendorId = req.params.vendorId;

    if (!vendorId) {
      return res.status(400).json({ error: 'Vendor ID is required in the route' });
    }

    if (!authReq.user?.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = UpdateVendorSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.format() });
    }

    const dto: UpdateVendorDto = result.data;

    // Log to inspect what is coming in the request body
    console.log('DTO:', dto);

    // Explicitly type profileFields to include panNumber and AadharNumber
    const { panNumber, AadharNumber, status, ...profileFields }: { 
      panNumber?: string; 
      AadharNumber?: string; 
      status?: SharedVendorStatus; 
      [key: string]: any; 
    } = dto;

    // Add panNumber and AadharNumber to the update fields
    if (panNumber) {
      profileFields.panNumber = panNumber;
    }

    if (AadharNumber) {
      profileFields.AadharNumber = AadharNumber;
    }

    // Log the final profileFields to check if panNumber and AadharNumber are correctly included
    console.log('Updated Fields:', profileFields);

    // Update the vendor profile in the database
    const updatedVendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: profileFields,
    });

    return res.status(200).json({ vendor: updatedVendor });
  } catch (err) {
    logger.error('Error updating vendor profile', err);
    return res.status(500).json({ error: 'Failed to update vendor profile' });
  }
};


/**
 * Step 4: Complete vendor profile registration
 */
export const completeVendorProfileRegistration = async (req: Request, res: Response) => {
  try {
    logger.info('Starting completeVendorProfileRegistration');
    const { userId, bankDetails, vendorDetails } = req.body;
    const files = req.files as Express.Multer.File[] | undefined; // KYC files (optional)

    logger.info(`Received userId: ${userId}`);
    logger.info(`Received bankDetails: ${bankDetails ? 'present' : 'missing'}`);
    logger.info(`Received vendorDetails: ${vendorDetails ? 'present' : 'missing'}`);
    logger.info(`Number of files received: ${files ? files.length : 0}`);

    if (!userId || !bankDetails || !vendorDetails) {
      logger.warn('Missing required fields userId, bankDetails or vendorDetails');
      return res.status(400).json({ error: 'User ID, bankDetails, and vendorDetails are required' });
    }

    // Optional KYC documents
    let kycBuffers: Buffer[] = [];
    let kycFilenames: string[] = [];

    if (files && files.length > 0) {
      kycBuffers = files.map(file => file.buffer);
      kycFilenames = files.map(file => file.originalname);
      logger.info(`Processing ${files.length} KYC documents`);
    } else {
      logger.info('No KYC documents uploaded, proceeding without KYC');
    }

    const vendor = await vendorService.completeVendorProfileRegistration(
      userId,
      vendorDetails,    // vendorData
      bankDetails,      // bankData
      kycBuffers,       // KYC file buffers, empty array if none
      kycFilenames      // optional
    );

    logger.info(`Vendor profile registration completed successfully for userId: ${userId}`);

    return res.status(201).json({ vendor });
  } catch (err) {
    logger.error('Error completing vendor profile registration', err);
    return res.status(500).json({ error: 'Failed to complete vendor profile' });
  }
};

export const updateBankDetailsController = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    
    // The text data from the form is in req.body
    const bankUpdateData = req.body;

    // The uploaded file (if any) is in req.file, added by multer
    const cancelledChequeFile = req.file;

    // Call the correct service function with all three arguments
    const updatedBank = await vendorService.updateOrAddVendorBankDetails(
      vendorId,
      bankUpdateData,
      cancelledChequeFile
    );
    
    res.status(200).json({ success: true, data: updatedBank });
  } catch (err: any) {
    logger.error('[updateBankDetailsController] Error:', err.message);
    res.status(400).json({ success: false, message: err.message || 'An unknown error occurred' });
  }
};
/**
 * Update vendor fields (excluding status-only updates)
 */
export const updateVendor = async (req: Request, res: Response) => {
  try {
    const vendorId = req.params.vendorId;

    const result = UpdateVendorSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.format() });
    }

    const dto: UpdateVendorDto = result.data;
    const updateData: Record<string, any> = { ...dto };

    if (dto.status !== undefined) {
      updateData.status = toPrismaStatus(dto.status);
    }

    const vendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: updateData,
    });

    return res.status(200).json({ vendor });
  } catch (err) {
    logger.error('Error updating vendor', err);
    return res.status(500).json({ error: 'Failed to update vendor' });
  }
};


/**
 * Get vendor by ID
 */
export const getVendorById = async (req: Request, res: Response) => {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: req.params.id },
    });

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    return res.status(200).json({ vendor });
  } catch (err) {
    logger.error('Error fetching vendor by ID', err);
    return res.status(500).json({ error: 'Failed to fetch vendor' });
  }
};

/**
 * Get all vendors
 */
export const getAllVendors = async (_req: Request, res: Response) => {
  try {
    const vendors = await prisma.vendor.findMany();
    return res.status(200).json({ vendors });
  } catch (err) {
    logger.error('Error fetching all vendors', err);
    return res.status(500).json({ error: 'Failed to fetch vendors' });
  }
};

/**
 * Delete a vendor by ID
 */
export const deleteVendor = async (req: Request, res: Response) => {
  try {
    await prisma.vendor.delete({
      where: { id: req.params.id },
    });
    return res.status(204).send();
  } catch (err) {
    logger.error('Error deleting vendor', err);
    return res.status(500).json({ error: 'Failed to delete vendor' });
  }
};

/**
 * Upload vendor documents
 */
export const uploadVendorDocuments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const fileName = `vendor-docs/${id}/${Date.now()}-${file.originalname}`;
      const url = await uploadFileToMinIO({
        bucketName: 'vendor-docs',
        objectName: fileName,
        content: file.buffer,
        contentType: file.mimetype,
      });
      uploadedUrls.push(url);
    }

    const vendor = await prisma.vendor.update({
      where: { id },
      data: {
  kycDocsUrl: {
    push: uploadedUrls,
  },
},
    });

    res.status(200).json({
      message: 'Documents uploaded successfully',
      urls: uploadedUrls,
      vendor,
    });
  } catch (err) {
    logger.error('Error uploading vendor documents', err);
    return res.status(500).json({ message: 'Failed to upload documents' });
  }
};
export const approveVendor = async (req: Request, res: Response) => {
  try {
    const data = UpdateVendorStatusSchema.parse({
      id: req.params.id,
      status: SharedVendorStatus.APPROVED.toLowerCase(),
    });
    const vendor = await vendorService.updateStatus(data.id, data.status);
    res.json({ success: true, data: vendor });
  } catch (err) {
    logger.error('Approve Vendor Error:', err);
    return res.status(400).json({ success: false, error: 'Failed to approve vendor' });
  }
};

export const rejectVendor = async (req: Request, res: Response) => {
  try {
    const data = UpdateVendorStatusSchema.parse({
      id: req.params.id,
      status: SharedVendorStatus.REJECTED.toLowerCase(),
    });
    const vendor = await vendorService.updateStatus(data.id, data.status);
    res.json({ success: true, data: vendor });
  } catch (err) {
    logger.error('Reject Vendor Error:', err);
    return res.status(400).json({ success: false, error: 'Failed to reject vendor' });
  }
};

export const getVendorAnalytics = async (_req: Request, res: Response) => {
  try {
    // const analytics = await vendorService.getAnalytics();
    // res.json({ success: true, data: analytics });
  } catch (err) {
    logger.error('Vendor Analytics Error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
};

export const convertUserToVendor = async (req: Request, res: Response) => {
  try {
    const { userId, email, phone, altphone } = req.body;

    if (!userId || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await vendorService.handleUserBecameVendor({ userId, email, phone, altphone });

    res.status(200).json({ message: 'User successfully converted to vendor' });
  } catch (err) {
    logger.error('Error converting user to vendor', err);
    res.status(500).json({ error: 'Failed to convert user to vendor' });
  }
};
export const loginVendor = async (req: Request, res: Response) => {
  
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const loginResult = await vendorService.loginVendorUser(email, password);

    return res.status(200).json({
      message: 'Login successful',
      token: loginResult.token,
      userId: loginResult.userId,
      email: loginResult.email,
      role: loginResult.role,
    });
  }catch (err: unknown) {
  if (err instanceof Error) {
    logger.error('Vendor login error:', err);
    return res.status(401).json({ error: err.message || 'Invalid credentials' });
  } else {
    logger.error('Vendor login error:', err);
    return res.status(401).json({ error: 'Invalid credentials' });
  }
}
};


export const initiateForgotPasswordOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const result = await vendorService.initiateForgotPasswordOtp(email);
    return res.status(200).json(result);
  } catch (err) {
    logger.error('Error initiating forgot password OTP', err);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
};

// 2. Verify the OTP user submits
export const verifyForgotPasswordOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    const result = await vendorService.verifyForgotPasswordOtp(email, otp);
    return res.status(200).json(result);
  } catch (err) {
    logger.error('Error verifying forgot password OTP', err);
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }
};

// 3. Reset password after OTP verification
export const resetPasswordWithOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res.status(400).json({ error: 'Email, OTP and new password are required' });

    const result = await vendorService.resetPasswordWithOtp(email, otp, newPassword);
    return res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    logger.error('Error resetting password', err);
    return res.status(400).json({ error: 'Failed to reset password' });
  }
};
export const loginOrRegisterWithGoogle = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'Google ID token is required' });
    }

    // Call your service method to login or register with Google token
    const loginResult = await vendorService.loginOrRegisterWithGoogleIdToken(idToken);

    return res.status(200).json({
      message: 'Login/Register successful',
      token: loginResult.token,  // <-- token is here
      userId: loginResult.userId,
      email: loginResult.email,
      role: loginResult.role,
      vendorId: loginResult.vendorId,
      vendorStatus: loginResult.vendorStatus,
    });
  } catch (err) {
    logger.error('Google login/register error:', err);
    return res.status(401).json({ error: err instanceof Error ? err.message : 'Google login failed' });
  }
};

export const uploadVendorProfileImageController = async (req: Request, res: Response) => {
  try {
    const vendorId = req.params.vendorId;
    const { file } = req.body;  // base64 string expected here

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate base64 format and extract mime type + data
    const matches = file.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid base64 image format' });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload to Cloudinary
    const uploadedImageUrl = await vendorService.uploadVendorProfileImage(vendorId, {
      buffer,
      mimetype: mimeType,
      originalname: `profile_${vendorId}`, // you can append extension if you want
    } as Express.Multer.File);

    res.status(200).json({ imageUrl: uploadedImageUrl });
  } catch (err: any) {
    console.error('Failed to upload profile image:', err);
    res.status(500).json({ error: err.message || 'Failed to upload profile image' });
  }
};

export const uploadVendorKYCDocumentsController = async (req: Request, res: Response) => {
  try {
    const vendorId = req.params.vendorId;
    console.log(`[Controller] Received request to upload KYC documents for vendorId: ${vendorId}`);
    console.log(`[Controller] Incoming Request Body: `, req.body);  // Log the body

    const { files } = req.body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      console.warn('[Controller] No base64 files provided');
      return res.status(400).json({ error: 'No files provided' });
    }

    // Decode base64 files and extract mimeType
    const filesWithMeta = files.map((file: any) => {
      const matches = file.base64.match(/^data:(.+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 format');
      }

      return {
        buffer: Buffer.from(matches[2], 'base64'),
        mimeType: matches[1],
        filename: file.filename,
      };
    });

    const buffers = filesWithMeta.map(f => f.buffer);
    const filenames = filesWithMeta.map((f, i) => f.filename || `kyc_doc_${Date.now()}_${i}`);
    const mimeTypes = filesWithMeta.map(f => f.mimeType);

    // Pass buffers, filenames, and mimeTypes to service
    const updatedVendor = await vendorService.uploadVendorKYCDocuments(vendorId, buffers, filenames, mimeTypes);

    console.log(`[Controller] Successfully uploaded KYC docs, returning updated vendor`);

    res.status(200).json({ kycDocsUrl: updatedVendor.kycDocsUrl });
  } catch (err: any) {
    console.error('[Controller] Failed to upload KYC documents:', err);
    res.status(500).json({ error: err.message || 'Failed to upload KYC documents' });
  }
};
