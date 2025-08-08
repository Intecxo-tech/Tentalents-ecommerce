import admin from 'firebase-admin';
import { UnauthorizedError } from '@shared/error';
export const verifyFirebaseToken = async (token) => {
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        return decodedToken;
    }
    catch (error) {
        throw new UnauthorizedError('Invalid Firebase token');
    }
};
//# sourceMappingURL=verifyFirebaseToken.js.map