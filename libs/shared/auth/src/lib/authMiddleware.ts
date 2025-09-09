import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './jwt';
import { AuthPayload, UserRole, ROLES } from './types';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

/**
 * Authentication middleware
 * @param allowedRoles Optional roles to restrict access
 * @param secret JWT secret (default from env)
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

      // If no specific roles are required, allow access
      if (!allowedRoles || (Array.isArray(allowedRoles) && allowedRoles.length === 0)) {
        next();
        return;
      }

      const required = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      // Admin can access anything
      if (userRole === ROLES.ADMIN) {
        next();
        return;
      }

      // Vendor access if required role is SELLER and token has vendorId
      if (required.includes(ROLES.SELLER) && decoded.vendorId) {
        next();
        return;
      }

      // Other roles: check role string directly
      if (required.includes(userRole)) {
        next();
        return;
      }

      // Forbidden
      res.status(403).json({
        message: `Forbidden: You do not have the required permissions for this action.`
      });
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
