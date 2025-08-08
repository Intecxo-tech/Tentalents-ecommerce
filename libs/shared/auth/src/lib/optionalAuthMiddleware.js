import { verifyToken } from './jwt';
/**
 * Express middleware to optionally decode a JWT and attach the user to req.user.
 * Doesn't block if token is missing or invalid.
 */
export function optionalAuthMiddleware(secret = process.env.JWT_SECRET) {
    return (req, _res, next) => {
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = verifyToken(token, secret);
                req.user = decoded;
            }
            catch (err) {
                console.warn('⚠️ [optionalAuthMiddleware] Invalid or expired token.');
                req.user = undefined;
            }
        }
        next();
    };
}
//# sourceMappingURL=optionalAuthMiddleware.js.map