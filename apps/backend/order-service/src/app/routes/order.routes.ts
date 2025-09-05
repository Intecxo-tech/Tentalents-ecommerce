import { Router } from 'express';
import { 
  placeOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  addAddress,
  editAddress,
  deleteAddress,
  getUserAddresses ,
  getVendorOrders,
  updateDispatchStatus,
   cancelOrder
 
} from '../controllers/order.controller';
import { authMiddleware, requireRole } from '@shared/auth';

const router = Router();
router.get(
  '/addresses',
  authMiddleware(['buyer', 'buyer_seller']),  // Ensure the user is authenticated
  getUserAddresses  // Fetch all addresses for the authenticated user
);

router.post(
  '/addresses',
  authMiddleware(['buyer', 'buyer_seller']),  // Ensure the user is authenticated
  addAddress  // Add a new address for the authenticated user
);


router.patch(
  '/addresses/:id',
  authMiddleware(['buyer', 'buyer_seller']),  // Ensure the user is authenticated
  editAddress  // Edit an existing address for the authenticated user
);

router.delete(
  '/addresses/:id',
  authMiddleware(['buyer', 'buyer_seller']),  // Ensure the user is authenticated
  deleteAddress  // Delete an address for the authenticated user
);
// Orders routes
router.post(
  '/', 
  authMiddleware(['buyer', 'buyer_seller']),  // Ensuring the user is authenticated
  placeOrder
);
router.post(
  '/:id/cancel',
  authMiddleware(['buyer', 'buyer_seller']),
  cancelOrder
);
router.get(
  '/', 
  authMiddleware(),  // Ensure user is authenticated
  requireRole('buyer', 'buyer_seller'),  // Ensure the correct role
  getUserOrders  // Fetch all orders for the authenticated user
);

router.get(
  '/:id', 
  authMiddleware(),  // User needs to be authenticated
  getOrderById  // Fetch a specific order by ID
);

router.patch(
  '/:id',
  authMiddleware(), 
  requireRole('admin', 'super_admin'),  // Only admins can update order status
  updateOrderStatus  // Update the order status
);
router.patch(
  '/vendor/orders/:id/dispatch',
  authMiddleware(['vendor', 'buyer_seller', 'seller']),
  updateDispatchStatus
);
// Address routes
router.get(
  '/vendor/orders',
  authMiddleware(['vendor', 'buyer_seller', 'seller']),
  getVendorOrders
);


export default router;
