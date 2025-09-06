// apps/backend/user-service/src/app/routes/user-routes.ts
import { Router } from 'express';
import multer from 'multer';
import {
  getProfile,
  updateRole,
  updateProfileImage,
  updateProfile,
  googleLogin,
} from '../controllers/user.controller';
import { authMiddleware, requireRole } from '@shared/auth';

const router = Router();

// JWT authentication middleware
const authenticateJWT = authMiddleware();

// Multer setup for in-memory uploads (Cloudinary)
const upload = multer({ storage: multer.memoryStorage() });

// -------------------
// User Routes
// -------------------

// GET /api/users/profile — fetch logged-in user profile
router.get('/profile', authenticateJWT, getProfile);

// PATCH /api/users/profile — update profile (name, phone, altPhone)
router.patch('/profile', authenticateJWT, updateProfile);

// PATCH /api/users/:id/role — only super_admin can update roles
router.patch('/:id/role', authenticateJWT, requireRole('super_admin'), updateRole);

// PATCH /api/users/profile/image — upload/update profile image
router.patch('/profile/image', authenticateJWT, upload.single('avatar'), updateProfileImage);

// POST /api/users/google-login — OAuth login
router.post('/google-login', googleLogin);

// Export router
export default router;
