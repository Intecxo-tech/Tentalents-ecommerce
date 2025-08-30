import { Request, Response, NextFunction } from 'express';
import { UserRole, AuthPayload } from './types'; 

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

/**
 * 🔐 Middleware to enforce role-based access control (RBAC).
 * Accepts one or more allowed roles.
 *
 * @param allowedRoles - List of roles permitted to access the route
 *
 * @example
 * app.get('/admin', requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), handler);
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user?.role) {
      return res.status(403).json({
        message: 'Access denied',
        detail: 'No authenticated user or role found on request',
      });
    }

    // Ensure that user.role is always treated as an array
    const userRoles = Array.isArray(user.role) ? user.role : [user.role];

    // Check if any of the user's roles are in the allowed roles
    if (!userRoles.some(role => allowedRoles.includes(role))) {
      return res.status(403).json({
        message: 'Access denied',
        detail: `Required role(s): [${allowedRoles.join(', ')}], but found: '${
          userRoles.join(', ')
        }'`,
      });
    }

    next();
  };
}
