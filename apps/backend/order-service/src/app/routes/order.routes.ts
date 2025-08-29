import { Router } from 'express';
import { 
  placeOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  addAddress,
  editAddress,
  deleteAddress,
  getUserAddresses,
  getVendorOrders
} from '../controllers/order.controller';
import { authMiddleware, requireRole } from '@shared/auth';

const router = Router();

// ------------------- Address routes -------------------
router.get(
  '/addresses',
  authMiddleware(['buyer', 'buyer_seller']),
  getUserAddresses
);

router.post(
  '/addresses',
  authMiddleware(['buyer', 'buyer_seller']),
  addAddress
);

router.patch(
  '/addresses/:id',
  authMiddleware(['buyer', 'buyer_seller']),
  editAddress
);

router.delete(
  '/addresses/:id',
  authMiddleware(['buyer', 'buyer_seller']),
  deleteAddress
);

// ------------------- Buyer Orders routes -------------------
router.post(
  '/',
  authMiddleware(['buyer', 'buyer_seller']),
  placeOrder
);

router.get(
  '/',
  authMiddleware(['buyer', 'buyer_seller']),
  getUserOrders
);

router.get(
  '/:id',
  authMiddleware(['buyer', 'buyer_seller', 'vendor', 'admin']),
  getOrderById
);

// ------------------- Order status update -------------------
// Admin can update any order
router.patch(
  '/:id/status',
  authMiddleware(['admin', 'super_admin']),
  updateOrderStatus
);

// ------------------- Vendor Orders routes -------------------
// Vendor can view their orders
router.get(
  '/vendor/orders',
  authMiddleware(['vendor']),
  getVendorOrders
);

// Vendor can update their own order status
router.patch(
  '/vendor/orders/:id/status',
  authMiddleware(['vendor']),
  updateOrderStatus
);

export default router;
