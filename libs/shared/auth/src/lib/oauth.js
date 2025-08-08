import jwt from 'jsonwebtoken';
export function oauthMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token)
        return res.status(401).json({ message: 'Missing OAuth token' });
    try {
        const decoded = jwt.decode(token); // Customize mapping if needed
        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(401).json({ message: 'Invalid OAuth token' });
    }
}
//# sourceMappingURL=oauth.js.map