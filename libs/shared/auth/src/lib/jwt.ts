import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { AuthPayload } from './types';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../..', '.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret';

if (!process.env.JWT_SECRET) {
  console.warn('⚠️ Warning: JWT_SECRET env variable is not set, using default secret.');
}

/**
 * Sign a JWT token with AuthPayload
 */
export function signToken(
  payload: AuthPayload,
  secret: Secret,
  expiresIn: SignOptions['expiresIn'] = '1h'
): string {
  return jwt.sign(payload, secret, { expiresIn });
}
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
export function generateJWT(payload: AuthPayload): string {
  return signToken(payload, JWT_SECRET, '1h');
}
export function generateRefreshToken(payload: { userId: string }) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '30d' }); // 👈 stays valid for 30 days
}
/**
 * Verify a JWT token and return decoded AuthPayload
 * Throws error if invalid or expired
 */
export function verifyToken(token: string, secret: Secret): AuthPayload {
  const decoded = jwt.verify(token, secret);

  if (typeof decoded === 'object' && 'userId' in decoded && 'role' in decoded) {
    return decoded as AuthPayload;
  }

  throw new Error('Invalid token payload structure');
}
