// import { Request, Response, NextFunction } from 'express';
// import { verifyToken } from './jwt';
// import { AuthPayload, UserRole } from './types'; // ✅ No @shared/types import
import { verifyToken } from './jwt';
export function authMiddleware(allowedRoles, secret = process.env['JWT_SECRET']) {
    return (req, res, next) => {
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
            const decoded = verifyToken(token, secret);
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
        }
        catch (err) {
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
//# sourceMappingURL=authMiddleware.js.map