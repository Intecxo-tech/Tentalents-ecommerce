import { Request, Response } from 'express';
import { verifyFirebaseToken } from '@shared/auth';

export const handleGoogleLogin = async (req: Request, res: Response) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: 'Missing idToken' });
  }

  try {
    const decodedToken = await verifyFirebaseToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // TODO: You can create or fetch vendor in DB here if needed

    return res.status(200).json({
      message: 'Vendor logged in with Google',
      user: { uid, email, name, picture },
    });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid Firebase token', error: err });
  }
};
