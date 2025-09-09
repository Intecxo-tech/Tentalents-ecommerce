import type { Request, Response, NextFunction } from 'express';
import type { AuthPayload } from './types'; // centralized AuthPayload

/**
 * Middleware to check if the authenticated user has one of the allowed roles
 * @param roles Array of allowed roles
 */
export const checkRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // TS now knows req.user exists from the global augmentation
    const user = req.user as AuthPayload | undefined;

    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient role' });
    }

    next();
  };
};
