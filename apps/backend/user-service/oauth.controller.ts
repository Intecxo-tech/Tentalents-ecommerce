import { Request, Response } from 'express';
import { verifyFirebaseToken, signToken } from '@shared/auth';
import { PrismaClient, UserRole } from '../../../generated/user-service';
import { SERVICE_NAMES } from '@shared/constants';
import { UnauthorizedError } from '@shared/error';

const prisma = new PrismaClient();

export const handleGoogleLogin = async (req: Request, res: Response) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: 'Missing idToken' });
  }

  try {
    const decodedToken = await verifyFirebaseToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    if (!email) throw new UnauthorizedError('Firebase token missing email');

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          avatarUrl: picture,
          firebaseUid: uid,
          role: UserRole.BUYER,
        },
      });
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      service: SERVICE_NAMES.USER,
    };

    const token = signToken(payload);

    return res.status(200).json({
      message: 'User logged in with Google',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
      token,
    });
  } catch (err: any) {
    console.error('❌ Google login failed:', err);
    return res.status(401).json({ message: 'Unauthorized', error: err.message || err });
  } finally {
    await prisma.$disconnect();
  }
};
