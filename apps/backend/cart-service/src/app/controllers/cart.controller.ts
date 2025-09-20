import { Request, Response, NextFunction } from 'express';
import { cartService } from '../services/cart.service';
import { sendSuccess } from '@shared/utils';
import type { AuthPayload } from '@shared/auth';
import { logger } from '@shared/logger';
interface AuthedRequest extends Request {
  user?: AuthPayload;
}

const extractUserId = (req: AuthedRequest): string | null => {
  return (
    req.user?.userId ||
    req.query.sessionId?.toString() ||
    req.body.sessionId ||
    null
  );
};
export const deleteCartItem = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract userId and itemId from request
    const userId = extractUserId(req);
    const itemId = req.params.itemId;

    // Check if userId or itemId are missing
    if (!userId || !itemId) {
      return res.status(400).json({ message: '❌ Missing userId or itemId' });
    }

    // Call cartService to delete the item from the cart
    const updatedCart = await cartService.deleteCartItem(userId, itemId);

    // Return the updated cart response
    return sendSuccess(res, '🗑️ Cart item deleted successfully', updatedCart);
  } catch (err) {
    // Log the error and pass it to the next error handler
    logger.error('Error deleting cart item:', err);
    next(err);
  }
};


/**
 * GET /api/cart
 * Fetch the current cart for an authenticated user or guest
 */
export const getCart = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = extractUserId(req);
    if (!userId) {
      return res
        .status(400)
        .json({ message: '❌ Missing userId or sessionId' });
    }

    const cart = await cartService.getCart(userId);
    return sendSuccess(res, '🛒 Cart fetched successfully', cart);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/cart
 * Add an item to the user's or guest's cart
 */
export const toggleSaveForLater = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = extractUserId(req);
    if (!userId) {
      return res.status(400).json({ message: '❌ Missing userId or sessionId' });
    }

    const { itemId, saveForLater } = req.body;

    if (typeof saveForLater !== 'boolean' || !itemId) {
      return res.status(400).json({ message: '❌ Invalid request body' });
    }

    const updatedItem = await cartService.toggleSaveForLater(userId, itemId, saveForLater);

    return sendSuccess(res, '✅ Item save-for-later status updated', updatedItem);
  } catch (err) {
    next(err);
  }
};
export const addToCart = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = extractUserId(req);

    logger.info('[CartController] 🧾 Incoming add-to-cart request', {
      userId,
      body: req.body,
    });

    if (!userId) {
      logger.warn('[CartController] ❌ Missing userId or sessionId');
      return res
        .status(400)
        .json({ message: '❌ Missing userId or sessionId' });
    }

    const cart = await cartService.addToCart(userId, req.body.item); // Make sure this is `req.body.item`

    logger.info('[CartController] ✅ Item added successfully', { cart });

    return sendSuccess(res, '✅ Item added to cart', cart);
  } catch (err) {
    logger.error('[CartController] ❌ Failed to add item to cart', err);
    next(err);
  }
};
/**
 * POST /api/cart/checkout
 * Checkout the user's or guest's cart
 */
export const checkoutCart = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = extractUserId(req);
    if (!userId) {
      return res
        .status(400)
        .json({ message: '❌ Missing userId or sessionId' });
    }

    const result = await cartService.checkout(userId);
    return sendSuccess(res, '✅ Cart checked out successfully', result);
  } catch (err) {
    next(err);
  }
};
export const updateCartItemQuantity = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = extractUserId(req);
    if (!userId) {
      return res.status(400).json({ message: '❌ Missing userId or sessionId' });
    }

    const { listingId, quantityChange } = req.body;
    const updatedCart = await cartService.updateCartItemQuantity(userId, listingId, quantityChange);

    return sendSuccess(res, '✅ Cart item quantity updated', updatedCart);
  } catch (err) {
    next(err);
  }
};
