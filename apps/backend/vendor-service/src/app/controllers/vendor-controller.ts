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

    const vendor = await vendorService.getByVendorId(vendorId);

    return res.status(200).json({ vendor });
  } catch (err) {
    logger.error('Error fetching vendor profile by vendor ID', err);
    return res.status(500).json({ error: 'Failed to fetch vendor profile' });
  }
};
export const updateVendorProfile = async (req: Request, res: Response) => {
  // cast req to AuthenticatedRequest locally
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

    // Remove status field if you don't want it updated here
    const { status, ...profileFields } = dto;

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
    const { userId, bankDetails, vendorDetails } = req.body;
    const files = req.files as Express.Multer.File[]; // KYC files

    if (!userId || !bankDetails || !vendorDetails) {
      return res.status(400).json({ error: 'User ID, bankDetails, and vendorDetails are required' });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'KYC documents are required' });
    }

    // Extract file buffers and filenames
    const kycBuffers = files.map(file => file.buffer);
    const kycFilenames = files.map(file => file.originalname);

    const vendor = await vendorService.completeVendorProfileRegistration(
      userId,
      vendorDetails,    // vendorData
      bankDetails,      // bankData
      kycBuffers,       // KYC file buffers
      kycFilenames      // optional
    );

    return res.status(201).json({ vendor });
  } catch (err) {
    logger.error('Error completing vendor profile registration', err);
    return res.status(500).json({ error: 'Failed to complete vendor profile' });
  }
};
export const updateBankDetailsController = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    const bankUpdateData = req.body;

    const updatedBank = await vendorService.updateVendorBankDetails(vendorId, bankUpdateData);
    
    res.status(200).json({ success: true, data: updatedBank });
  } catch (err) {
    res.status(400).json({ success: false });
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

    if (dto.status !== undefined) {
      await produceKafkaEvent({
        topic: KAFKA_TOPICS.VENDOR.STATUS_UPDATED,
        messages: [
          {
            value: JSON.stringify({
              vendorId: vendor.id,
              status: vendor.status,
              updatedAt: vendor.updatedAt.toISOString(),
            }),
          },
        ],
      });
    }

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
  console.log('BODY:', req.body);
  try {
    const vendorId = req.params.vendorId;
    const { file } = req.body; // expecting base64 string here

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Convert base64 string to buffer
    const base64Data = file.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const imageUrl = await vendorService.uploadVendorProfileImage(vendorId, {
      buffer: imageBuffer,
      mimetype: 'image/png', // or detect from string
      originalname: `profile_${vendorId}.png`,
    } as Express.Multer.File);
console.log('BODY:', req.body); // or
console.log('Base64 Data:', file); 
    res.status(200).json({ imageUrl });
  } catch (err: any) {
    logger.error('Failed to upload profile image:', err);
    res.status(500).json({ error: err.message || 'Failed to upload profile image' });
  }
};


export const uploadVendorKYCDocumentsController = async (req: Request, res: Response) => {
  try {
    const vendorId = req.params.vendorId;
    const files = req.files as Express.Multer.File[]; // Expect multiple files

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const buffers = files.map(file => file.buffer);
    const filenames = files.map(file => file.originalname);

    const updatedVendor = await vendorService.uploadVendorKYCDocuments(vendorId, buffers, filenames);
    res.status(200).json({ kycDocsUrl: updatedVendor.kycDocsUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to upload KYC documents' });
  }
};

