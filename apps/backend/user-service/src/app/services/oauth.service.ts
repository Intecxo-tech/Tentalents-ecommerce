import { adminAuth } from '@shared/utils'; // ✅ use renamed export
import { UnauthorizedError } from '@shared/error';

export const verifyFirebaseToken = async (token: string) => {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token); // ✅ updated usage
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
      emailVerified: decodedToken.email_verified,
    };
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    throw new UnauthorizedError('Invalid Firebase token');
  }
};
