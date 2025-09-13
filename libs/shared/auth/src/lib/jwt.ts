import jwt, { Secret } from 'jsonwebtoken';
import { AuthPayload, ROLES } from './types';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../..', '.env') });

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';

if (!JWT_SECRET) throw new Error('JWT_SECRET not set');

export function signToken(payload: AuthPayload, secret: Secret = JWT_SECRET, expiresIn?: string): string {
  return jwt.sign(payload, secret, expiresIn ? { expiresIn } : {});
}

export function verifyToken(token: string, secret: Secret = JWT_SECRET): AuthPayload {
  const decoded = jwt.verify(token, secret);
  if (typeof decoded !== 'object' || decoded === null) throw new Error('Invalid token payload');
  return { ...(decoded as any), role: (decoded as any).role || ROLES.VENDOR };
}
