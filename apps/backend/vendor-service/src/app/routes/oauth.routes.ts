import { Router } from 'express';
import { handleGoogleLogin } from '../controllers/oauth.controller';

const router = Router();

router.post('/google', handleGoogleLogin);

export default router;
