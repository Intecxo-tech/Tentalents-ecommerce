import { Request, Response, NextFunction } from 'express';
import { UserRole } from './types';
import { AuthPayload } from './types';
declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}
/**
 * Middleware to ensure the user is authenticated
 */
export declare const requireAuth: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Middleware to ensure the user has one of the allowed roles
 */
export declare const requireRole: (roles: UserRole | UserRole[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=roleGuard.d.ts.map