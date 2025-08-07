import { Request, Response, NextFunction } from 'express';
import { auth } from 'firebase-admin'; // ✅ Make sure path alias is correctly configured

// Extend Express Request type to include oauthUser
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
  } catch (error: any) {
    console.error('Firebase token verification failed:', error.message);
    res.status(401).json({ message: 'Invalid or expired ID token' });
  }
};
