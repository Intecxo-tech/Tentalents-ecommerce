// apps/vendor-service/src/app/routes/vendor-cloudinary.routes.ts
import { Router } from 'express';
import multer from 'multer';
import { updateVendorProfileImage } from '../controllers/vendor-cloudinary.controller';
import { authMiddleware } from '@shared/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const authenticateJWT = authMiddleware();

// PATCH /api/vendors/profile/image
router.patch(
  '/profile/image',
  authenticateJWT,
  upload.single('avatar'),
  updateVendorProfileImage
);

export default router;
