import { Router } from 'express';
import { googleOAuthLogin } from '../controllers/oauth.controller';

const router = Router();

router.post('/auth/google', googleOAuthLogin);

export default router;
