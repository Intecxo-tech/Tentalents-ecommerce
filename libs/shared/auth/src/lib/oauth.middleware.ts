import { Request, Response, NextFunction } from 'express';
import { auth } from 'firebase-admin';

declare module 'express' {
  interface Request {
    oauthUser?: {
      uid: string;
      email?: string;
      name?: string;
      picture?: string;
      emailVerified?: boolean;
    };
  }
}

export const oauthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.split('Bearer ')[1]
    : null;

  if (!token) {
    res.status(401).json({ message: 'No ID token provided in Authorization header' });
    return; // ✅ prevents further execution
  }

  try {
    const decodedToken = await auth().verifyIdToken(token);

    req.oauthUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
      emailVerified: decodedToken.email_verified,
    };

    next(); // ✅ continue to route
  } catch (error: any) {
    console.error('Firebase token verification failed:', error.message);
    res.status(401).json({ message: 'Invalid or expired ID token' });
    return; // ✅ stop here
  }
};
