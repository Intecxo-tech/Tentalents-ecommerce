// apps/cart-service/src/app/routes/cart.routes.ts
import { Router } from 'express';
import cartControllerRouter from '../controllers/cart.controller';
import { optionalAuthMiddleware } from '@shared/auth';

const router = Router();

/**
 * 🧩 Optional authentication middleware:
 * - Authenticated users: via JWT in Authorization header
 * - Guests: via `sessionId` in query or body
 */
router.use(optionalAuthMiddleware()); // ✅ Call factory

// Mount all cart controller routes under `/cart`
router.use('/', cartControllerRouter);

export default router;
