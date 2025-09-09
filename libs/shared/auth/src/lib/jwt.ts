// libs/auth/src/lib/jwt.ts

import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { AuthPayload, ROLES } from './types';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../..', '.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';

if (!process.env.JWT_SECRET) {
  console.warn('⚠️ Warning: JWT_SECRET env variable is not set, using default secret.');
}

/**
 * Sign a JWT token with AuthPayload
 */
export function signToken(
  payload: AuthPayload,
  secret: Secret = JWT_SECRET,
  expiresIn?: SignOptions['expiresIn'] // no default
): string {
  return jwt.sign(payload, secret, expiresIn ? { expiresIn } : {});
}

export function generateJWT(payload: AuthPayload): string {
  return signToken(payload, JWT_SECRET, '1h');
}

export function generateRefreshToken(payload: { userId: string }): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '30d' });
}

/**
 * Verify a JWT token and return decoded AuthPayload
 * Throws error if invalid or expired
 */
export function verifyToken(token: string, secret: Secret = JWT_SECRET): AuthPayload {
  const decoded = jwt.verify(token, secret);

  console.log('🔓 Decoded JWT:', decoded);

  if (typeof decoded !== 'object' || decoded === null) {
    throw new Error('Token payload is not an object');
  }

  const hasEmail = 'email' in decoded;
  const hasRole = 'role' in decoded;
  const hasVendorId = 'vendorId' in decoded;

  if (hasEmail && (hasRole || hasVendorId)) {
    // Assign default role = 'vendor' if role is missing but vendorId is present
    const payload: AuthPayload = {
      ...(decoded as any),
      role: hasRole ? (decoded as any).role : ROLES.VENDOR,
    };
    return payload;
  }

  throw new Error('Invalid token payload structure');
}