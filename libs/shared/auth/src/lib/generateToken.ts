// libs/shared/auth/src/lib/generateToken.ts
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { AuthPayload, UserRole } from './types';
import { signToken } from './jwt';

dotenv.config({ path: path.resolve(__dirname, '../../../../..', '.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret';

if (!JWT_SECRET || JWT_SECRET === 'super_secret') {
  console.error('❌ JWT_SECRET not set correctly in .env');
  process.exit(1);
}

const prisma = new PrismaClient();

/**
 * Generate JWT token for a given email.
 * Finds a vendor first, then user. Creates dummy user if not found.
 */
async function generateTokenForEmail(email?: string): Promise<string> {
  if (!email) throw new Error('Email must be provided');

  try {
    // Find vendor by email
    const vendor = await prisma.vendor.findFirst({ where: { email } });

    // If vendor not found, find or create a user
    let user = null;
    if (!vendor) {
      user = await prisma.user.findFirst({ where: { email } });
      if (!user) {
        console.log('User not found. Creating dummy user...');
        user = await prisma.user.create({
          data: {
            email,
            role: 'admin', // or 'super_admin'
          },
        });
        console.log('Dummy user created:', user.email);
      }
    }

    // Prepare JWT payload
    let payload: AuthPayload;
    if (vendor) {
      payload = {
        userId: vendor.userId ?? undefined,
        email: vendor.email,
        role: 'seller' as UserRole, // assuming vendor role
        vendorId: vendor.id,
      };
    } else if (user) {
      payload = {
        userId: user.id,
        email: user.email,
        role: user.role as UserRole,
      };
    } else {
      throw new Error(`No valid user or vendor found for email: ${email}`);
    }

    // Sign JWT token
    const token = signToken(payload, JWT_SECRET, '1h');

    // Store token in userToken table
    await prisma.userToken.create({
      data: {
        token,
        userId: payload.userId ?? null,
        vendorId: payload.vendorId ?? null,
        revoked: false,
        createdAt: new Date(),
      },
    });

    console.log('\n🔐 Generated JWT Token:\n', token);
    console.log('\n👉 Use in Authorization header:\n');
    console.log(`Authorization: Bearer ${token}`);

    return token;
  } catch (err) {
    console.error('❌ Error generating token:', err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

// Self-invoking for quick test
(async () => {
  try {
    const email = 'dummy@example.com';
    await generateTokenForEmail(email);
  } catch (err) {
    console.error('❌ Failed to generate token:', err);
  }
})();

export { generateTokenForEmail };
