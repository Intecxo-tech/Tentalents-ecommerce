import { Router } from 'express';
import { getProfile, updateRole,updateProfileImage,updateProfile } from '../controllers/user.controller';
import { authMiddleware, requireRole } from '@shared/auth';
import multer from 'multer';
const router = Router();

// Middleware to authenticate JWT
const authenticateJWT = authMiddleware();
const upload = multer({ storage: multer.memoryStorage() }); 
// GET /api/users/profile — Accessible to any authenticated user
router.get('/profile', authenticateJWT, getProfile);
router.patch('/profile', authenticateJWT, updateProfile);
// PATCH /api/users/:id/role — Restricted to super_admin role only
router.patch(
  '/:id/role',
  authenticateJWT,
  requireRole('super_admin'),
  updateRole
);
// router.post('/logout', authenticate, logoutUser);
router.patch('/profile/image', authenticateJWT, upload.single('avatar'), updateProfileImage);
export default router;
