import { PrismaClient } from '@prisma/client';
import { AuthPayload, ROLES, UserRole } from './types';
import { signToken } from './jwt';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../..', '.env') });

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET not set');

const prisma = new PrismaClient();

export async function generateTokenForEmail(email?: string): Promise<string> {
  if (!email) throw new Error('Email must be provided');

  let vendor = await prisma.vendor.findFirst({ where: { email } });
  let user = vendor ? null : await prisma.user.findFirst({ where: { email } });

  if (!vendor && !user) {
    user = await prisma.user.create({ data: { email, role: ROLES.ADMIN } });
  }

  const payload: AuthPayload = vendor
    ? { userId: vendor.userId ?? '', email: vendor.email, role: ROLES.VENDOR, vendorId: vendor.id }
    : { userId: user!.id, email: user!.email, role: user!.role as UserRole };

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

  await prisma.$disconnect();
  return token;
}
