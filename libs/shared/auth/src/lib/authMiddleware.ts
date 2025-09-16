// libs/shared/auth/src/lib/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './jwt';
import { AuthPayload, ROLES, UserRole } from './types';

// Permanent token from environment (bypasses DB/auth checks)
const PERMANENT_TOKEN = process.env.PERMANENT_JWT_TOKEN;

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

/**
 * Authentication & role-based authorization middleware.
 * Supports permanent token, JWT, and hybrid roles (admin, seller/vendor).
 *
 * @param allowedRoles Single role or array of roles to allow for the route
 */
export function authMiddleware(allowedRoles?: UserRole | UserRole[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or malformed Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token not provided' });

    try {
      let decoded: AuthPayload;

      // --- Permanent token bypass ---
      if (PERMANENT_TOKEN && token === PERMANENT_TOKEN) {
        decoded = {
          userId: 'admin',
          email: 'admin@example.com',
          role: ROLES.SUPER_ADMIN,
        };
      } else {
        // JWT verification
        decoded = await verifyToken(token) as AuthPayload;
      }

      req.user = decoded;

      // If no roles specified, any authenticated user is allowed
      const requiredRoles: UserRole[] = Array.isArray(allowedRoles)
        ? allowedRoles
        : allowedRoles
        ? [allowedRoles]
        : [];
      if (!requiredRoles.length) return next();

      // Admins always have access
      const adminRoles: UserRole[] = [ROLES.ADMIN, ROLES.SUPER_ADMIN];
      if (adminRoles.includes(decoded.role)) return next();

      // Seller/vendor check
      if (requiredRoles.includes(ROLES.SELLER) && decoded.vendorId) return next();

      // Regular role match
      if (requiredRoles.includes(decoded.role)) return next();

      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    } catch (err: any) {
      if (err?.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Access token expired' });
      }
      return res.status(403).json({ message: 'Invalid token' });
    }
  };
}

export const requireAuth = authMiddleware;
