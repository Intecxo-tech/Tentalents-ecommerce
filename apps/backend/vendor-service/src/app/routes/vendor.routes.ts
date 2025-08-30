import { Router } from 'express';
import multer from 'multer';
import {
  initiateVendorRegistrationOtp,
  verifyVendorEmailOtp,
  completeVendorUserRegistration,
  getVendorProfileByVendorId,
  updateVendorProfile,
  approveVendor,
  rejectVendor
} from '../controllers/vendor-controller'; // Correct import path
import { requireAuth } from '@shared/auth'; // Correct import for the authenticate middleware
import { UserRole } from '@shared/types';
import type { RequestHandler } from 'express';

const router = Router();

// Multer setup for file uploads (5MB max size)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Public routes (no authentication required)
router.post('/register/initiate-otp', initiateVendorRegistrationOtp);  // Initiate OTP
router.post('/register/verify-otp', verifyVendorEmailOtp);  // Verify OTP
router.post('/register/user', completeVendorUserRegistration);  // Complete registration
router.post('/login', () => {});  // Placeholder for vendor login logic

// Protected routes (authentication required)
router.get('/profile/:vendorId', requireAuth([UserRole.SELLER, UserRole.ADMIN]) as RequestHandler, getVendorProfileByVendorId);  // Get vendor profile
router.put('/profile/:vendorId', requireAuth([UserRole.SELLER, UserRole.ADMIN]) as RequestHandler, updateVendorProfile);  // Update vendor profile

// Vendor status updates (admin only)
router.patch('/:id/approve', requireAuth([UserRole.ADMIN]) as RequestHandler, approveVendor);  // Admin: approve vendor
router.patch('/:id/reject', requireAuth([UserRole.ADMIN]) as RequestHandler, rejectVendor);  // Admin: reject vendor

export default router;
