import { Router } from 'express';
import {
  authenticate,
  initiateVendorRegistrationOtp,
  verifyVendorEmailOtp,
  completeVendorUserRegistration,
  loginVendorUser,
  getVendorProfileByVendorId,
  updateVendorProfile,
  approveVendor,
  rejectVendor,
  uploadVendorProfileImage,
  upload,
} from '../controllers/vendor-controller';
import { ROLES, requireRole } from '@shared/auth';

const router = Router();

// ---------------- OTP REGISTRATION ----------------
router.post('/otp/initiate', initiateVendorRegistrationOtp);
router.post('/otp/verify', verifyVendorEmailOtp);

// ---------------- COMPLETE REGISTRATION ----------------
router.post('/register', completeVendorUserRegistration);

// ---------------- LOGIN ----------------
router.post('/login', loginVendorUser);

// ---------------- VENDOR PROFILE ----------------
router.get(
  '/:vendorId',
  authenticate,
  requireRole(ROLES.VENDOR, ROLES.ADMIN, ROLES.SUPER_ADMIN),
  getVendorProfileByVendorId
);

router.put(
  '/:vendorId',
  authenticate,
  requireRole(ROLES.VENDOR, ROLES.ADMIN, ROLES.SUPER_ADMIN),
  updateVendorProfile
);

// ---------------- VENDOR STATUS ----------------
router.post(
  '/:id/approve',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  approveVendor
);

router.post(
  '/:id/reject',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  rejectVendor
);

// ---------------- VENDOR PROFILE IMAGE UPLOAD ----------------
router.post(
  '/:vendorId/profile-image',
  authenticate,
  requireRole(ROLES.VENDOR, ROLES.ADMIN, ROLES.SUPER_ADMIN),
  upload.single('file'), // multer middleware for single file upload
  uploadVendorProfileImage
);

export default router;
