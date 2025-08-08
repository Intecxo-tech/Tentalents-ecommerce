import { auth } from 'firebase-admin'; // ✅ Make sure path alias is correctly configured
export const oauthMiddleware = async (req, res, next) => {
    const { idToken } = req.body;
    if (!idToken) {
        res.status(401).json({ message: 'ID token is required' });
        return;
    }
    try {
        const decodedToken = await auth().verifyIdToken(idToken);
        req.oauthUser = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            name: decodedToken.name,
            picture: decodedToken.picture,
            emailVerified: decodedToken.email_verified,
        };
        next();
    }
    catch (error) {
        console.error('Firebase token verification failed:', error.message);
        res.status(401).json({ message: 'Invalid or expired ID token' });
    }
};
//# sourceMappingURL=oauth.middleware.js.map