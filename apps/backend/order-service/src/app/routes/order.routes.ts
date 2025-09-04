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
  updateDispatchStatus,
  downloadInvoice, 
  cancelOrder,   // <-- add this
  returnOrder  // ✅ Import invoice download
} from '../controllers/order.controller';
import { requireAuth, ROLES } from '@shared/auth'; // ✅ Use ROLES constants

const router = Router();

// ---------------- ROLE GROUPS ----------------
const BUYER_ONLY = [ROLES.BUYER, ROLES.BUYER_SELLER];
const SELLER_OR_ADMIN = [ROLES.SELLER, ROLES.ADMIN];
const ADMIN_ONLY = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

// ---------------- ROUTES ----------------

// Place a new order
router.post('/', requireAuth(BUYER_ONLY), placeOrder);

// Get all orders for a user
router.get('/my-orders', requireAuth(BUYER_ONLY), getUserOrders);

// Get order by ID (any role with access)
router.get(
  '/:orderId',
  requireAuth([...BUYER_ONLY, ...SELLER_OR_ADMIN, ...ADMIN_ONLY]),
  getOrderById
);

// Update order status (seller/admin)
router.patch('/:orderId/status', requireAuth(SELLER_OR_ADMIN), updateOrderStatus);

// ---------------- ADDRESS MANAGEMENT ----------------
router.post('/address', requireAuth(BUYER_ONLY), addAddress);
router.put('/address/:addressId', requireAuth(BUYER_ONLY), editAddress);
router.delete('/address/:addressId', requireAuth(BUYER_ONLY), deleteAddress);
router.get('/addresses', requireAuth(BUYER_ONLY), getUserAddresses);

// ---------------- VENDOR ORDERS ----------------
router.get('/vendor/orders', requireAuth(SELLER_OR_ADMIN), getVendorOrders);
router.patch('/:orderId/dispatch', requireAuth(SELLER_OR_ADMIN), updateDispatchStatus);

// ---------------- INVOICE DOWNLOAD ----------------
// Customers can download their invoice anytime
router.get(
  '/invoice/:invoiceId/download',
  requireAuth(BUYER_ONLY), // Only the buyer can download
  downloadInvoice
);
// Cancel order
router.post('/:orderId/cancel', requireAuth(BUYER_ONLY), cancelOrder);

// Return order
router.post('/:orderId/return', requireAuth(BUYER_ONLY), returnOrder);

export default router;
