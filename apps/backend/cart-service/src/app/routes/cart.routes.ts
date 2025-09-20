import { Router } from 'express';
import {
  getCart,
  addToCart,
  checkoutCart,
    updateCartItemQuantity,
    toggleSaveForLater,  
    deleteCartItem
} from '../controllers/cart.controller';
import { optionalAuthMiddleware } from '@shared/auth'; // ✅ Supports JWT or guest session

const router = Router();

/**
 * 🧩 Optional authentication middleware:
 * - Authenticated users: via JWT in Authorization header
 * - Guests: via `sessionId` in query or body
 */
router.post('/update', updateCartItemQuantity);
router.use(optionalAuthMiddleware()); // ✅ Call factory
router.patch('/save-for-later', toggleSaveForLater);
/**
 * @route   GET /api/cart?sessionId=...
 * @desc    Retrieve cart (authenticated or guest)
 */
router.get('/', getCart);

/**
 * @route   POST /api/cart/add
 * @desc    Add item to cart (authenticated or guest)
 * @body    { sessionId?: string, item: { productId, quantity, ... } }
 */
router.post('/add', addToCart);
router.delete('/:itemId', deleteCartItem);
/**
 * @route   POST /api/cart/checkout
 * @desc    Checkout cart (authenticated or guest)
 * @body    { sessionId?: string }
 */
router.post('/checkout', checkoutCart);

export default router;
