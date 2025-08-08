import { Router } from 'express';
import {
   initiateOtp,
  verifyOtp,
  completeOtpRegistration,
  loginUser,
  
  resendOtp
} from '../controllers/user.controller';

const router = Router();

// Public routes — no authentication required
router.post('/register/otp/initiate', initiateOtp);
router.post('/register/otp/verify', verifyOtp);
router.post('/register/otp/complete', completeOtpRegistration);
router.post('/register/otp/resend', resendOtp);
router.post('/login', loginUser);

// router.post('/google-login', googleLogin);
export default router;
