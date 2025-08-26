
import { Router } from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadProductImage,
   getProductsByVendor,
  getProductsForCard,
  getProductBySlug
} from '../controllers/product.controller';
import { authMiddleware, requireRole } from '@shared/auth';

const router = Router();

// 🛒 Create product (seller/admin/super_admin)
router.post(
  '/',
  authMiddleware(),
  requireRole('seller', 'admin', 'super_admin'),
  createProduct
);

// 📦 Get all products (public)
router.get('/', getAllProducts);
router.get('/cards', getProductsForCard);
router.get('/vendor/products', authMiddleware(), getProductsByVendor);

// 🔍 Get product by slug (public)
router.get('/slug/:slug', getProductBySlug);

// 🔍 Get product by ID (public)
router.get('/:id', getProductById);

// 📝 Update product (seller/admin/super_admin)
router.put('/:id', authMiddleware(), updateProduct);
router.delete('/:id', authMiddleware(), deleteProduct);

// 🖼️ Upload product image to Cloudinary
router.post(
  '/:id/image',
  authMiddleware(),
  requireRole('seller', 'admin', 'super_admin'),
  uploadProductImage
);

export default router;
