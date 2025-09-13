import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { AuthPayload, ROLES } from './types';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../..', '.env') });

// Ensure JWT secrets are not undefined
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not set in .env');
if (!process.env.JWT_REFRESH_SECRET) throw new Error('JWT_REFRESH_SECRET not set in .env');

const JWT_SECRET: string = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET;

export function signToken(
  payload: AuthPayload,
  secret: Secret = JWT_SECRET,
  expiresIn?: SignOptions['expiresIn']
): string {
  return jwt.sign(payload, secret, expiresIn ? { expiresIn } : {});
}

export function verifyToken(token: string, secret: Secret = JWT_SECRET): AuthPayload {
  const decoded = jwt.verify(token, secret);

  if (typeof decoded !== 'object' || decoded === null) {
    throw new Error('Invalid token payload');
  }

  return {
    ...(decoded as any),
    role: 'role' in decoded ? (decoded as any).role : ROLES.VENDOR,
  };
}

export function generateJWT(payload: AuthPayload): string {
  return signToken(payload, JWT_SECRET, '1h');
}

export function generateRefreshToken(payload: { userId: string }): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '30d' });
}
