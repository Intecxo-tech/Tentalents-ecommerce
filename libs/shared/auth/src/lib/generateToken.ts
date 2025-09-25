import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { AuthPayload, ROLES, UserRole } from './types';
import { signToken } from './jwt';

dotenv.config({ path: path.resolve(__dirname, '../../../../..', '.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret';

if (!JWT_SECRET || JWT_SECRET === 'super_secret') {
  console.error('❌ JWT_SECRET not set correctly in .env');
  process.exit(1);
}

const prisma = new PrismaClient();

async function generateTokenForEmail(email?: string): Promise<string> {
  try {
    if (!email) {
      throw new Error('Email must be provided');
    }

    let vendor = await prisma.vendor.findFirst({ where: { email } });
    let user = null;

    if (!vendor) {
      user = await prisma.user.findFirst({ where: { email } });
      if (!user) {
        // Optional: Create a dummy user if not found
        console.log('User not found. Creating dummy user...');
        user = await prisma.user.create({
          data: {
            email,
            role: ROLES.ADMIN, // or default role
          },
        });
        console.log('Dummy user created:', user.email);
      }
    }

    let payload: AuthPayload;

    if (vendor) {
      if (!vendor.email) throw new Error('Vendor email is null');

      payload = {
        userId: vendor.userId ?? undefined,
        email: vendor.email,
        role: ROLES.VENDOR,
        vendorId: vendor.id,
      };
    } else if (user) {
      if (!user.email) throw new Error('User email is null');

      const role = user.role ?? ROLES.ADMIN;

      payload = {
        userId: user.id,
        email: user.email,
        role: role as UserRole,
      };
    } else {
      throw new Error(`No valid user or vendor found for email: ${email}`);
    }

    const token = signToken(payload, JWT_SECRET);

    await prisma.userToken.create({
      data: {
        token,
        userId: payload.userId ?? null,
        vendorId: payload.vendorId ?? null,
        revoked: false,
        createdAt: new Date(),
      },
    });

    console.log('\n🔐 Generated JWT Token:\n');
    console.log(token);
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
(async () => {
  try {
    const email = 'dummy@example.com';  // or any email string you want to test
    await generateTokenForEmail(email);
  } catch (err) {
    console.error('❌ Failed to generate token:', err);
  }
})();
export { generateTokenForEmail };
