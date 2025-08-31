import { Request, Response, NextFunction } from 'express';
import { AuthPayload, UserRole } from './types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized', detail: 'Authentication token missing or invalid' });
  }
  next();
};

export const requireRole = (roles: UserRole | UserRole[]) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.role) {
      return res.status(403).json({ message: 'Forbidden', detail: 'User role missing' });
    }

    const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];
    const hasAccess = userRoles.some(r => allowedRoles.includes(r));

    if (!hasAccess) {
      return res.status(403).json({
        message: 'Forbidden',
        detail: `Required role(s): [${allowedRoles.join(', ')}], found: [${userRoles.join(', ')}]`,
      });
    }

    next();
  };
};
