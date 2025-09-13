import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './jwt';
import { AuthPayload, UserRole } from './types';

declare module 'express' {
  export interface Request {
    user?: AuthPayload;
  }
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET not set');

export function authMiddleware(allowedRoles?: UserRole | UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ message: 'Missing or malformed Authorization header' });

    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyToken(token, JWT_SECRET);
      req.user = decoded;

      if (allowedRoles) {
        const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];
        if (!userRoles.some(r => allowed.includes(r as UserRole))) {
          return res.status(403).json({ message: 'Forbidden', detail: `Required roles: [${allowed.join(', ')}]` });
        }
      }

      next();
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') return res.status(401).json({ message: 'Token expired' });
      return res.status(403).json({ message: 'Invalid token' });
    }
  };
}

export const requireAuth = authMiddleware;
