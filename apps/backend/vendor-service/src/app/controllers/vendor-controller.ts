import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { logger } from '@shared/logger';
import { UserRole } from '@shared/auth';
import { VendorStatus } from '@shared/types';
import { vendorService } from '../services/vendor-service';
import { UpdateVendorStatusSchema, UpdateVendorSchema } from '../schemas/vendor.schema';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret';
const upload = multer({ storage: multer.memoryStorage() });

// ---------------- AUTHENTICATED REQUEST ----------------
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole | UserRole[]; // Allow array for dual roles
    vendorId?: string;
  };
}

// ---------------- AUTH ----------------
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
    logger.error('Authentication failed', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ---------------- OTP REGISTRATION ----------------
export const initiateVendorRegistrationOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const result = await vendorService.initiateVendorRegistrationOtp(email);
    res.status(200).json(result);
  } catch (err) {
    logger.error('Error initiating vendor OTP', err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

export const verifyVendorEmailOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

  try {
    const result = await vendorService.verifyVendorEmailOtp(email, otp);
    res.status(200).json(result);
  } catch (err) {
    logger.error('Error verifying vendor OTP', err);
    res.status(400).json({ error: 'Invalid or expired OTP' });
  }
};

export const completeVendorUserRegistration = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  try {
    const result = await vendorService.completeVendorUserRegistration(email, password);
    res.status(201).json(result);
  } catch (err) {
    logger.error('Error completing vendor user registration', err);
    res.status(500).json({ error: 'Failed to register vendor user' });
  }
};

// ---------------- PROFILE ----------------
export const getVendorProfileByVendorId = async (req: Request, res: Response) => {
  const { vendorId } = req.params;
  if (!vendorId) return res.status(400).json({ error: 'Vendor ID is required' });

  try {
    const vendor = await vendorService.getByVendorId(vendorId);
    res.status(200).json({ vendor });
  } catch (err) {
    logger.error('Error fetching vendor profile', err);
    res.status(500).json({ error: 'Failed to fetch vendor profile' });
  }
};

export const updateVendorProfile = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const vendorId = req.params.vendorId;

  if (!vendorId) return res.status(400).json({ error: 'Vendor ID is required in the route' });
  if (!authReq.user?.userId) return res.status(401).json({ error: 'Unauthorized' });

  const result = UpdateVendorSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.format() });

  try {
    const { status, ...profileFields } = result.data;
    const updatedVendor = await vendorService.updateVendorProfile(vendorId, profileFields);
    res.status(200).json({ vendor: updatedVendor });
  } catch (err) {
    logger.error('Error updating vendor profile', err);
    res.status(500).json({ error: 'Failed to update vendor profile' });
  }
};

// ---------------- VENDOR STATUS ----------------
export const approveVendor = async (req: Request, res: Response) => {
  const data = UpdateVendorStatusSchema.parse({
    id: req.params.id,
    status: VendorStatus.APPROVED.toLowerCase(),
  });

  try {
    const vendor = await vendorService.updateStatus(data.id, data.status);
    res.json({ success: true, data: vendor });
  } catch (err) {
    logger.error('Approve Vendor Error:', err);
    res.status(400).json({ success: false, error: 'Failed to approve vendor' });
  }
};

export const rejectVendor = async (req: Request, res: Response) => {
  const data = UpdateVendorStatusSchema.parse({
    id: req.params.id,
    status: VendorStatus.REJECTED.toLowerCase(),
  });

  try {
    const vendor = await vendorService.updateStatus(data.id, data.status);
    res.json({ success: true, data: vendor });
  } catch (err) {
    logger.error('Reject Vendor Error:', err);
    res.status(400).json({ success: false, error: 'Failed to reject vendor' });
  }
};
