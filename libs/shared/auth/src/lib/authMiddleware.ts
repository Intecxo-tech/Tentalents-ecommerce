import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './jwt';
import { AuthPayload, UserRole, ROLES } from './types';

declare module 'express' {
  export interface Request {
    user?: AuthPayload;
  }
}

export function authMiddleware(
  allowedRoles?: UserRole | UserRole[], // allowedRoles can be a single UserRole or an array of UserRoles
  secret: string = process.env['JWT_SECRET']!
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    // Check if the Authorization header exists and is in the correct format
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Missing or malformed Authorization header' });
      return;
    }

    // Extract token from the header
    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'Token not provided' });
      return;
    }

    try {
      // Verify the token and extract the payload
      const decoded = verifyToken(token, secret) as AuthPayload;
      req.user = decoded;

      // Normalize allowedRoles to always be an array for comparison
      let allowed: UserRole[] = [];

      // If allowedRoles is undefined, we will allow all roles
      if (allowedRoles) {
        // If allowedRoles is a single role, make it an array
        allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      }

      // Get the user's role (this works whether it's a single role or an array of roles)
      const userRole = req.user.role;

      // Check if user role matches any of the allowed roles
      if (allowed.length > 0 && !Array.isArray(userRole) && !allowed.includes(userRole)) {
        res.status(403).json({
          message: `Forbidden: Role "${userRole}" not authorized`,
        });
        return;
      }

      // If the user's role is an array, check if any of the allowed roles match
      if (Array.isArray(userRole) && !userRole.some(role => allowed.includes(role))) {
        res.status(403).json({
          message: `Forbidden: Roles ${userRole.join(', ')} not authorized`,
        });
        return;
      }

      // Proceed to the next middleware or route handler
      next();
    } catch (err: any) {
      console.error('❌ [authMiddleware] Token verification failed:', err);

      // Handle token expiration error
      if (err.name === 'TokenExpiredError') {
        res.status(401).json({ message: 'Access token expired' });
        return;
      }

      // Handle any other errors (e.g., invalid token)
      res.status(403).json({ message: 'Invalid token' });
    }
  };
}

export const requireAuth = authMiddleware;
