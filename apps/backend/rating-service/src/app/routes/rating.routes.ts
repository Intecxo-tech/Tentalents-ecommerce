import { Router } from 'express';
import { authMiddleware } from '@shared/auth';
import {
  createRating,
  updateRating,
  deleteRating,
  getRatingsByProduct,
} from '../controllers/rating.controller';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Ensure the uploads directory exists before multer tries to save files
const uploadDir = path.resolve(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Created upload directory at ${uploadDir}`);
}


const storage = multer.memoryStorage();


const upload = multer({ storage });
const router = Router();

router.post(
  '/rate',
  authMiddleware(['buyer', 'buyer_seller']),
  upload.fields([
    { name: 'imageFile', maxCount: 1 },
    { name: 'videoFile', maxCount: 1 },
  ]), // multer middleware parses files first
  createRating // controller can now access req.files
);

router.put('/:id', authMiddleware(['buyer', 'buyer_seller']), updateRating);
router.delete('/:id', authMiddleware(['buyer', 'buyer_seller']), deleteRating);
router.get('/product/:productId', getRatingsByProduct);

export default router;
