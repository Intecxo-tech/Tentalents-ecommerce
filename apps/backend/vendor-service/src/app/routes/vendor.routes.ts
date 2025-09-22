import { Router, Request as ExpressRequest } from 'express';
import multer from 'multer';
import type { FileFilterCallback } from 'multer';
import {
  updateVendor,
  getVendorById,
  updateBankDetailsController,
  getAllVendors,
  uploadCancelledCheque,
  deleteVendor,
  uploadVendorDocuments,
  approveVendor,
  rejectVendor,
  getVendorAnalytics,
  userBecameVendorController,
  initiateVendorRegistrationOtp,
  verifyVendorEmailOtp,
  completeVendorUserRegistration,
  completeVendorProfileRegistration,
  getVendorProfileByVendorId,
  loginOrRegisterWithGoogle,
  updateVendorProfile,
  uploadVendorProfileImageController,
  uploadVendorKYCDocumentsController,
  loginVendor,
  getVendorReturnRequestsController, // ✅ added controller
} from '../controllers/vendor-controller';

import { authMiddleware } from '@shared/auth';
import { UserRole } from '@shared/types';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (
    req: ExpressRequest,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    const isAccepted =
      file.mimetype.startsWith('image/') || file.mimetype.startsWith('application/');
    if (!isAccepted) {
      return cb(new Error('Only images or documents are allowed'));
    }
    cb(null, true);
  },
});

// === Public / auth-free routes ===
router.post('/google', loginOrRegisterWithGoogle);
router.get('/profile/:vendorId', authMiddleware(), getVendorProfileByVendorId);
router.post('/register/initiate-otp', initiateVendorRegistrationOtp);
router.post('/register/verify-otp', verifyVendorEmailOtp);
router.post('/register/user', completeVendorUserRegistration);
router.put('/vendors/:vendorId/bank-details', updateBankDetailsController);
router.post('/login', loginVendor);

// === Protected routes (auth required) ===
router.post(
  '/register/profile',
  authMiddleware([UserRole.BUYER, UserRole.SELLER]),
  completeVendorProfileRegistration
);

router.get('/', authMiddleware(UserRole.ADMIN), getAllVendors);
router.post('/convert', authMiddleware(), userBecameVendorController);
router.get('/:id', authMiddleware(), getVendorById);
router.put('/profile/:vendorId', authMiddleware([UserRole.SELLER]), updateVendorProfile);
// router.put('/:id', authMiddleware(UserRole.SELLER), updateVendor);
router.delete('/:id', authMiddleware(UserRole.ADMIN), deleteVendor);

router.post(
  '/:id/documents',
  authMiddleware(UserRole.SELLER),
  upload.array('documents'),
  uploadVendorDocuments
);

router.patch('/:id/approve', authMiddleware(UserRole.ADMIN), approveVendor);
router.patch('/:id/reject', authMiddleware(UserRole.ADMIN), rejectVendor);

router.get(
  '/:id/analytics',
  authMiddleware([UserRole.ADMIN, UserRole.SELLER]),
  getVendorAnalytics
);

router.post('/profile-image/:vendorId', authMiddleware(UserRole.SELLER), uploadVendorProfileImageController);

router.post(
  '/cancelled-cheque/:vendorId',
  authMiddleware(UserRole.SELLER),
  upload.single('file'),
  uploadCancelledCheque
);

router.post('/kyc-docs/:vendorId', authMiddleware(UserRole.SELLER), uploadVendorKYCDocumentsController);

// === Vendor Return Requests Route ===
router.get(
  '/return-requests/:vendorId',
  authMiddleware([UserRole.SELLER]),
  getVendorReturnRequestsController
);

export default router;
