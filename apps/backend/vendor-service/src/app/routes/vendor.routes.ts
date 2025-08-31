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
} from '../controllers/vendor-controller';
import { requireAuth, ROLES } from '@shared/auth'; // use ROLES object

const router = Router();

// Multer setup for file uploads (5MB max)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ---------------- PUBLIC ROUTES ---------------- //
router.post('/register/initiate-otp', initiateVendorRegistrationOtp);
router.post('/register/verify-otp', verifyVendorEmailOtp);
router.post('/register/user', completeVendorUserRegistration);
router.post('/login', () => {}); // Placeholder

// ---------------- PROTECTED ROUTES ---------------- //
// RBAC arrays
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

// ---------------- ADMIN ONLY ---------------- //
// Approve vendor
router.patch('/:id/approve', requireAuth(ADMIN_ONLY), approveVendor);

// Reject vendor
router.patch('/:id/reject', requireAuth(ADMIN_ONLY), rejectVendor);

export default router;
