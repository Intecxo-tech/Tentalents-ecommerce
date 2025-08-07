import { Request, Response, NextFunction } from 'express';
import { verifyFirebaseToken } from '../services/oauth.service';

export const googleOAuthLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Missing Firebase token' });
    }

    const userData = await verifyFirebaseToken(token);

    // TODO: Optionally check or create user in DB here

    return res.status(200).json({ user: userData });
  } catch (error) {
    next(error);
  }
};
