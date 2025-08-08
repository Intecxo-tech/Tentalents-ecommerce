// import { Request, Response, NextFunction } from 'express';
// import { verifyToken } from './jwt';
// import { AuthPayload, UserRole } from './types'; // ✅ No @shared/types import

// declare global {
//   namespace Express {
//     interface Request {
//       user?: AuthPayload;
//     }
//   }
// }

// export function authMiddleware(
//   allowedRoles?: UserRole | UserRole[],
//   secret: string = process.env['JWT_SECRET']!
// ) {
//   return (req: Request, res: Response, next: NextFunction): void => {
//     const authHeader = req.headers.authorization;

//     if (!authHeader?.startsWith('Bearer ')) {
//       res
//         .status(401)
//         .json({ message: 'Missing or malformed Authorization header' });
//       return;
//     }

//     const token = authHeader.split(' ')[1];

//     if (!token) {
//       return res.status(401).json({ message: 'Token not provided' });
//       return;
//     }

//     try {
//       const decoded = verifyToken(token, secret) as AuthPayload;
//       req.user = decoded;

//       if (allowedRoles) {
//         const allowed = Array.isArray(allowedRoles)
//           ? allowedRoles
//           : [allowedRoles];
//         if (!allowed.includes(req.user.role)) {
//           res
//             .status(403)
//             .json({
//               message: `Forbidden: Role "${req.user.role}" not authorized`,
//             });
//           return;
//         }
//       }

//       next();
//     } catch (err) {
//       console.error('❌ [authMiddleware] Token verification failed:', err);
//       return res.status(403).json({ message: 'Invalid or expired token' });
//     }
//   };
// }

// export const requireAuth = authMiddleware;

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
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
 console.log('Authorization header:', authHeader);
    if (!authHeader?.startsWith('Bearer ')) {
      res
        .status(401)
        .json({ message: 'Missing or malformed Authorization header' });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      // ✅ CORRECTED
      res.status(401).json({ message: 'Token not provided' });
      return;
    }

    try {
      const decoded = verifyToken(token, secret) as AuthPayload;
      req.user = decoded;

      if (allowedRoles) {
        const allowed = Array.isArray(allowedRoles)
          ? allowedRoles
          : [allowedRoles];
        if (!allowed.includes(req.user.role)) {
          res
            .status(403)
            .json({
              message: `Forbidden: Role "${req.user.role}" not authorized`,
            });
          return;
        }
      }

      next();
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