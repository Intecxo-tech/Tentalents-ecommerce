import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { logger } from '@shared/logger';
import { AuthPayload } from '@shared/auth';
import { VendorStatus } from '@shared/types';
import { vendorService } from '../services/vendor-service';
import {
  CreateVendorSchema,
  UpdateVendorSchema,
  UpdateVendorStatusSchema,
} from '../dto/vendor.dto';

// ---------------- MULTER CONFIG ----------------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ---------------- AUTHENTICATED REQUEST ----------------
export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

// ---------------- AUTH MIDDLEWARE ----------------
export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });

  const token = authHeader.split(' ')[1];
  try {
    req.user = vendorService.verifyJwtToken(token);
    next();
  } catch (err) {
    logger.error('Authentication failed', err);
    res.status(401).json({ error: 'Invalid or expired token' });
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

// ---------------- COMPLETE REGISTRATION ----------------
export const completeVendorUserRegistration = async (req: Request, res: Response) => {
  const parseResult = CreateVendorSchema.safeParse(req.body);
  if (!parseResult.success) return res.status(400).json({ error: parseResult.error.format() });

  try {
    const vendorDto = parseResult.data;
    const result = await vendorService.completeVendorUserRegistration(vendorDto);
    res.status(201).json(result);
  } catch (err) {
    logger.error('Error completing vendor registration', err);
    res.status(500).json({ error: 'Failed to register vendor user' });
  }
};

// ---------------- LOGIN ----------------
export const loginVendorUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  try {
    const result = await vendorService.loginVendorUser(email, password);
    res.status(200).json(result);
  } catch (err) {
    logger.error('Vendor login failed', err);
    res.status(401).json({ error: 'Invalid credentials' });
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

export const updateVendorProfile = async (req: AuthenticatedRequest, res: Response) => {
  const { vendorId } = req.params;
  if (!vendorId || !req.user?.userId) return res.status(401).json({ error: 'Unauthorized' });

  const parseResult = UpdateVendorSchema.safeParse(req.body);
  if (!parseResult.success) return res.status(400).json({ error: parseResult.error.format() });

  try {
    const updatedVendor = await vendorService.updateVendorProfile(vendorId, parseResult.data);
    res.status(200).json({ vendor: updatedVendor });
  } catch (err) {
    logger.error('Error updating vendor profile', err);
    res.status(500).json({ error: 'Failed to update vendor profile' });
  }
};

// ---------------- VENDOR STATUS ----------------
const handleVendorStatusUpdate = async (req: Request, res: Response, status: VendorStatus) => {
  const parseResult = UpdateVendorStatusSchema.safeParse({ status });
  if (!parseResult.success) return res.status(400).json({ error: parseResult.error.format() });

  try {
    const vendor = await vendorService.updateStatus(req.params.id, parseResult.data.status);
    res.json({ success: true, data: vendor });
  } catch (err) {
    logger.error(`Vendor ${status} Error:`, err);
    res.status(400).json({ success: false, error: `Failed to ${status.toLowerCase()} vendor` });
  }
};

export const approveVendor = (req: Request, res: Response) =>
  handleVendorStatusUpdate(req, res, VendorStatus.APPROVED);

export const rejectVendor = (req: Request, res: Response) =>
  handleVendorStatusUpdate(req, res, VendorStatus.REJECTED);

// ---------------- VENDOR PROFILE IMAGE UPLOAD ----------------
export const uploadVendorProfileImage = async (req: Request, res: Response) => {
  const { vendorId } = req.params;
  const file = req.file;

  if (!vendorId || !file) return res.status(400).json({ error: 'Vendor ID and file are required' });

  try {
    const updatedVendor = await vendorService.uploadVendorProfileImage(
      vendorId,
      file.buffer,
      file.originalname,
      file.mimetype
    );
    res.status(200).json({ vendor: updatedVendor });
  } catch (err) {
    logger.error('Error uploading vendor profile image', err);
    res.status(500).json({ error: 'Failed to upload vendor profile image' });
  }
};

export { upload };
