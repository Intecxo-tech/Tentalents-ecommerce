/**
 * Middleware to ensure the user is authenticated
 */
export const requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            message: 'Unauthorized',
            detail: 'Authentication token missing or invalid',
        });
    }
    next();
};
/**
 * Middleware to ensure the user has one of the allowed roles
 */
export const requireRole = (roles) => {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return (req, res, next) => {
        if (!req.user?.role) {
            return res.status(403).json({
                message: 'Forbidden',
                detail: 'User role missing',
            });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Forbidden',
                detail: `User does not have the required role(s): ${allowedRoles.join(', ')}`,
            });
        }
        next();
    };
};
//# sourceMappingURL=roleGuard.js.map