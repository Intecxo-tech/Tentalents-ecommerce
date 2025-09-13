// libs/shared/auth/src/lib/generateToken.ts
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { AuthPayload, ROLES, UserRole } from './types';
import { signToken } from './jwt';

dotenv.config({ path: path.resolve(__dirname, '../../../../..', '.env') });

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET not set in .env');
  process.exit(1);
}

const prisma = new PrismaClient();

export async function generateTokenForEmail(email: string): Promise<string> {
  if (!email) throw new Error('Email must be provided');

  try {
    const vendor = await prisma.vendor.findFirst({ where: { email } });
    let user = null;

    if (!vendor) {
      user = await prisma.user.findFirst({ where: { email } });
      if (!user) {
        // Dev/test only: create dummy user
        console.log('User not found. Creating dummy user...');
        user = await prisma.user.create({
          data: {
            email,
            role: ROLES.ADMIN,
          },
        });
        console.log('Dummy user created:', user.email);
      }
    }

    // Build payload
    const payload: AuthPayload = vendor
      ? {
          userId: vendor.userId ?? undefined,
          email: vendor.email,
          role: ROLES.VENDOR,
          vendorId: vendor.id,
        }
      : {
          userId: user!.id,
          email: user!.email,
          role: (user!.role ?? ROLES.ADMIN) as UserRole,
        };

    // Sign token
    const token = signToken(payload, JWT_SECRET);

    // Save token in DB
    await prisma.userToken.create({
      data: {
        token,
        userId: payload.userId ?? null,
        vendorId: payload.vendorId ?? null,
        revoked: false,
        createdAt: new Date(),
      },
    });

    console.log('\n🔐 JWT Token:\n', token);
    console.log(`Authorization: Bearer ${token}`);

    return token;
  } catch (err) {
    console.error('❌ Error generating token:', err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

// Run directly for testing
if (require.main === module) {
  (async () => {
    try {
      await generateTokenForEmail('dummy@example.com');
    } catch (err) {
      console.error('❌ Failed to generate token:', err);
    }
  })();
}
