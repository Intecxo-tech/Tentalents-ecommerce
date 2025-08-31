import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './jwt';
// We need the ROLES object for comparisons
import { AuthPayload, UserRole, ROLES } from './types'; 
import { logger } from '@shared/middlewares/logger/src/index';

// Make sure your Express Request is properly extended
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

/**
 * A smarter, hybrid authentication middleware.
 * It checks for roles OR specific capabilities (like being a vendor).
 */
export function authMiddleware(
  allowedRoles?: UserRole | UserRole[],
  secret: string = process.env['JWT_SECRET']!
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Missing or malformed Authorization header' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'Token not provided' });
      return;
    }

    try {
      const decoded = verifyToken(token, secret) as AuthPayload;
      req.user = decoded;
      const userRole = decoded.role;

      // If the route doesn't require any specific role, just being logged in is enough.
      if (!allowedRoles || (Array.isArray(allowedRoles) && allowedRoles.length === 0)) {
        next();
        return;
      }

      const required = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      // --- START OF NEW HYBRID LOGIC ---

      // Rule 1: An ADMIN can do anything.
      if (userRole === ROLES.ADMIN) {
        logger.info(`[Auth] Admin access granted for user ${decoded.userId}`);
        next();
        return;
      }
      
      // Rule 2 (THE KEY CHANGE): Check for VENDOR capability.
      // If the route requires 'seller' role, we check if the token contains a 'vendorId'.
      // This is the TRUE test of whether they are a vendor, regardless of their role string.
      if (required.includes(ROLES.SELLER) && decoded.vendorId) {
        logger.info(`[Auth] Vendor access granted for user ${decoded.userId} (vendorId: ${decoded.vendorId})`);
        next();
        return;
      }

      // Rule 3: For all other cases (like BUYER), check the role string directly.
      if (required.includes(userRole)) {
        logger.info(`[Auth] Access granted for user ${decoded.userId} with role ${userRole}`);
        next();
        return;
      }
      
      // --- END OF NEW HYBRID LOGIC ---

      logger.warn(`[Auth] Forbidden: User ${decoded.userId} with role '${userRole}' tried to access route requiring '${required.join(', ')}'`);
      res.status(403).json({ message: `Forbidden: You do not have the required permissions for this action.` });
      return;

    } catch (err: any) {
      console.error('❌ [authMiddleware] Token verification failed:', err);
      if (err.name === 'TokenExpiredError') {
        res.status(401).json({ message: 'Access token expired' });
        return;
      }
      res.status(403).json({ message: 'Invalid token' });
      return;
    }
  };
}

export const requireAuth = authMiddleware;

