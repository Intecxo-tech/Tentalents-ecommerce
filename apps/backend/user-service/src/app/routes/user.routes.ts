import { Router } from 'express';
import { 
  getProfile, 
  updateRole, 
  updateProfileImage, 
  updateProfile, 
  googleLogin, 
  saveAddress, // renamed to match controller
  initiateOtp,
  verifyOtp,
  resendOtp,
  completeOtpRegistration,
  loginUser
} from '../controllers/user.controller';
import { authMiddleware, requireRole } from '@shared/auth';
import multer from 'multer';

const router = Router();
const authenticateJWT = authMiddleware();
const upload = multer({ storage: multer.memoryStorage() });

// --- Authentication & Registration ---
router.post('/register/initiate-otp', initiateOtp);
router.post('/register/verify-otp', verifyOtp);
router.post('/register/resend-otp', resendOtp);
router.post('/register/complete', completeOtpRegistration);

router.post('/login', loginUser);
router.post('/oauth-login', googleLogin);

// --- User Profile ---
router.get('/profile', authenticateJWT, getProfile);
router.patch('/profile', authenticateJWT, updateProfile);
router.patch('/profile/image', authenticateJWT, upload.single('avatar'), updateProfileImage);

// --- Role Management ---
router.patch('/:id/role', authenticateJWT, requireRole('super_admin'), updateRole);

// --- Address Management ---
router.post('/address', authenticateJWT, saveAddress);

export default router;
