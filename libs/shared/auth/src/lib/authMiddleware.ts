import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './jwt';
import { AuthPayload, UserRole } from './types';

declare module 'express' {
  export interface Request {
    user?: AuthPayload;
  }
}

export function authMiddleware(
  allowedRoles?: UserRole | UserRole[],
  secret: string = process.env['JWT_SECRET']!
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or malformed Authorization header' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = verifyToken(token, secret) as AuthPayload;
      req.user = decoded;

      if (allowedRoles) {
        const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];

        // No VENDOR/SELLER mapping needed, just use UserRole
        const hasAccess = userRoles.some(r => allowed.includes(r as UserRole));

        if (!hasAccess) {
          return res.status(403).json({
            message: 'Forbidden',
            detail: `Required role(s): [${allowed.join(', ')}], found: [${userRoles.join(', ')}]`,
          });
        }
      }

      next();
    } catch (err: any) {
      console.error('Token verification failed', err);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
  };
}

export const requireAuth = authMiddleware;