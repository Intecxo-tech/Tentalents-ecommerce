import { Router } from 'express';
import {
   initiateOtp,
  verifyOtp,
  completeOtpRegistration,
  loginUser,
  googleLogin,
  resendOtp,
  sendForgotPasswordOtp,      // <-- new
  verifyForgotPasswordOtp,    // <-- new
  resetPassword, 
} from '../controllers/user.controller';

const router = Router();
router.post('/google-login', googleLogin);
// Public routes — no authentication required
router.post('/register/otp/initiate', initiateOtp);
router.post('/register/otp/verify', verifyOtp);
router.post('/register/otp/complete', completeOtpRegistration);
router.post('/register/otp/resend', resendOtp);
router.post('/login', loginUser);
router.post('/forgot-password/initiate', sendForgotPasswordOtp);
router.post('/forgot-password/verify', verifyForgotPasswordOtp);
router.post('/forgot-password/reset', resetPassword);
// router.post('/google-login', googleLogin);
export default router;