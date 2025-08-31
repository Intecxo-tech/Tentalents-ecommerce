import { Router } from 'express';
import multer from 'multer';
import {
  initiateVendorRegistrationOtp,
  verifyVendorEmailOtp,
  completeVendorUserRegistration,
  getVendorProfileByVendorId,
  updateVendorProfile,
  approveVendor,
  rejectVendor,
  uploadVendorProfileImage,
} from '../controllers/vendor-controller';
import { requireAuth, ROLES } from '@shared/auth';

const router = Router();

// ---------------- MULTER SETUP ---------------- //
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// ---------------- PUBLIC ROUTES ---------------- //
router.post('/register/initiate-otp', initiateVendorRegistrationOtp);
router.post('/register/verify-otp', verifyVendorEmailOtp);
router.post('/register/user', completeVendorUserRegistration);
router.post('/login', () => {}); // Placeholder login route

// ---------------- PROTECTED ROUTES ---------------- //
// RBAC role arrays
const SELLER_OR_ADMIN = [ROLES.VENDOR, ROLES.ADMIN]; // Vendor = Seller
const ADMIN_ONLY = [ROLES.ADMIN];

// Get vendor profile
router.get(
  '/profile/:vendorId',
  requireAuth(SELLER_OR_ADMIN),
  getVendorProfileByVendorId
);

// Update vendor profile
router.put(
  '/profile/:vendorId',
  requireAuth(SELLER_OR_ADMIN),
  updateVendorProfile
);

// Upload vendor profile image
router.post(
  '/profile/:vendorId/upload-image',
  requireAuth(SELLER_OR_ADMIN),
  upload.single('profileImage'), // expects file under "profileImage" field
  uploadVendorProfileImage
);

// ---------------- ADMIN ONLY ---------------- //
// Approve vendor
router.patch('/:id/approve', requireAuth(ADMIN_ONLY), approveVendor);

// Reject vendor
router.patch('/:id/reject', requireAuth(ADMIN_ONLY), rejectVendor);

export default router;
