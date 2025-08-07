import { Router } from 'express';
import { handleGoogleLogin } from '../controllers/oauth.controller';

const router = Router();

router.post('/google', handleGoogleLogin); // POST /api/oauth/google

export default router;
