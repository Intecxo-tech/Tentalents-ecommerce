// apps/cart-service/src/app/cart.controller.ts
import { Router, Request, Response } from 'express';
import { cartService } from '../services/cart.service';

const router = Router();

/**
 * GET /cart
 * Fetch active cart (excluding saved-for-later items)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    const cart = await cartService.getCart(userId);
    return res.json({ cart });
  } catch (error) {
    console.error('GET /cart error:', error);
    return res.status(500).json({ message: 'Failed to fetch cart' });
  }
});

/**
 * POST /cart/add
 * Add a product listing to the cart
 */
router.post('/add', async (req: Request, res: Response) => {
  try {
    const { userId, listingId, productId, quantity } = req.body;
    if (!userId || !listingId || !productId || !quantity) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const updatedCart = await cartService.addToCart(userId, { listingId, productId, quantity });
    return res.json({ cart: updatedCart });
  } catch (error) {
    console.error('POST /cart/add error:', error);
    return res.status(500).json({ message: 'Failed to add item to cart' });
  }
});

/**
 * PATCH /cart/:listingId
 * Update quantity of a cart item
 */
router.patch('/:listingId', async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId as string;
    const quantityChange = Number(req.body.quantityChange);
    const listingId = req.params.listingId;

    if (!userId || !listingId || isNaN(quantityChange)) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const updatedCart = await cartService.updateCartItemQuantity(userId, listingId, quantityChange);
    return res.json({ cart: updatedCart });
  } catch (error) {
    console.error(`PATCH /cart/${req.params.listingId} error:`, error);
    return res.status(500).json({ message: 'Failed to update cart item' });
  }
});

/**
 * DELETE /cart/:itemId
 * Delete a cart item
 */
router.delete('/:itemId', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const itemId = req.params.itemId;
    if (!userId || !itemId) return res.status(400).json({ message: 'Missing userId or itemId' });

    const updatedCart = await cartService.deleteCartItem(userId, itemId);
    return res.json({ cart: updatedCart });
  } catch (error) {
    console.error(`DELETE /cart/${req.params.itemId} error:`, error);
    return res.status(500).json({ message: 'Failed to delete cart item' });
  }
});

/**
 * GET /cart/wishlist
 * Fetch saved-for-later items
 */
router.get('/wishlist', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    const wishlist = await cartService.getWishlist(userId);
    return res.json({ wishlist });
  } catch (error) {
    console.error('GET /cart/wishlist error:', error);
    return res.status(500).json({ message: 'Failed to fetch wishlist' });
  }
});

/**
 * PATCH /cart/:itemId/save-for-later
 * Toggle saved-for-later status
 */
router.patch('/:itemId/save-for-later', async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId as string;
    const saveForLater = Boolean(req.body.saveForLater);
    const itemId = req.params.itemId;

    if (!userId || !itemId) return res.status(400).json({ message: 'Missing userId or itemId' });

    const updatedCart = await cartService.toggleSaveForLater(userId, itemId, saveForLater);
    return res.json({ cart: updatedCart });
  } catch (error) {
    console.error(`PATCH /cart/${req.params.itemId}/save-for-later error:`, error);
    return res.status(500).json({ message: 'Failed to update saved-for-later status' });
  }
});

/**
 * POST /cart/checkout
 * Checkout all active cart items
 */
router.post('/checkout', async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId as string;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    const result = await cartService.checkout(userId);
    return res.json({ result });
  } catch (error) {
    console.error('POST /cart/checkout error:', error);
    return res.status(500).json({ message: 'Checkout failed' });
  }
});

export default router;
