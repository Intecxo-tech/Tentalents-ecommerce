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
  getVendorOrders,
  updateDispatchStatus
} from '../controllers/order.controller';
import { processOrder } from '../process-order'; // <-- Import the new function
import { authMiddleware, requireRole } from '@shared/auth';

const router = Router();

// Address routes
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

// Orders routes
router.post(
  '/',
  authMiddleware(['buyer', 'buyer_seller']),
  placeOrder
);

router.get(
  '/',
  authMiddleware(),
  requireRole('buyer', 'buyer_seller'),
  getUserOrders
);

router.get(
  '/:id',
  authMiddleware(),
  getOrderById
);

router.patch(
  '/:id',
  authMiddleware(),
  requireRole('admin', 'super_admin'),
  updateOrderStatus
);

// Vendor routes
router.patch(
  '/vendor/orders/:id/dispatch',
  authMiddleware(['vendor', 'buyer_seller', 'seller']),
  updateDispatchStatus
);

router.get(
  '/vendor/orders',
  authMiddleware(['vendor', 'buyer_seller', 'seller']),
  getVendorOrders
);

// NEW: Process order endpoint (generate PDF, email, Kafka event)
router.post(
  '/:id/process',
  authMiddleware(['buyer', 'buyer_seller']),
  async (req, res) => {
    try {
      const result = await processOrder(req.params.id);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
