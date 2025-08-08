import { Request, Response } from 'express';
import { verifyFirebaseToken, signToken } from '@shared/auth';
import { PrismaClient, UserRole } from '../../../generated/vendor-service'; 
import { VendorStatus } from '@shared/types';
import { SERVICE_NAMES } from '@shared/constants';
import { UnauthorizedError } from '@shared/error';

const prisma = new PrismaClient();

export const handleGoogleLogin = async (req: Request, res: Response) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: 'Missing idToken' });
  }

  try {
    // ✅ Verify Firebase token
    const decodedToken = await verifyFirebaseToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    if (!email) throw new UnauthorizedError('Firebase token missing email');

    // ✅ Check if vendor exists
    let vendor = await prisma.vendor.findUnique({ where: { email } });

    // ✅ If vendor doesn't exist, create one
    if (!vendor) {
      vendor = await prisma.vendor.create({
        data: {
          email,
          name,
          logo: picture,
          firebaseUid: uid,
          status: VendorStatus.PENDING,
        },
      });
    }

    // ✅ Sign JWT token for vendor
    const payload = {
      userId: vendor.id,
      email: vendor.email,
      role: UserRole.vendor,
      service: SERVICE_NAMES.VENDOR_SERVICE,
    };

    const token = signToken(payload);

    return res.status(200).json({
      message: 'Vendor logged in with Google',
      vendor: {
        id: vendor.id,
        email: vendor.email,
        name: vendor.name,
        logo: vendor.logo,
        status: vendor.status,
      },
      token,
    });
  } catch (err) {
    console.error('❌ Google login failed:', err);
    return res.status(401).json({ message: 'Unauthorized', error: err.message || err });
  } finally {
    await prisma.$disconnect();
  }
};
