// pages/api/verify-token.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from './jwt';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({ message: 'Missing token' });
  }

  try {
    const user = verifyToken(accessToken);
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
