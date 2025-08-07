import { Request, Response, NextFunction } from 'express';
import { firebaseAuth } from '@shared/utils'; // path resolved via tsconfig

export const oauthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: 'Missing idToken' });
  }

  try {
    const decodedToken = await firebaseAuth.verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid Firebase token', error: err });
  }
};
