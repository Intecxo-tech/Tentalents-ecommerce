import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { AuthPayload } from './types';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../..', '.env') });

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET env variable');
}

if (!JWT_REFRESH_SECRET) {
  throw new Error('Missing JWT_REFRESH_SECRET env variable');
}

/**
 * Sign a JWT token with AuthPayload
 */
export function signToken(
  payload: AuthPayload,
  expiresIn: SignOptions['expiresIn'] = '1h'
): string {
  return jwt.sign(payload, JWT_SECRET as Secret, { expiresIn });
}

/**
 * Generate an access JWT token (valid 1 hour)
 */
export function generateJWT(payload: AuthPayload): string {
  return signToken(payload, '1h');
}

/**
 * Generate a refresh JWT token (valid 30 days)
 */
export function generateRefreshToken(payload: { userId: string }): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET as Secret, { expiresIn: '30d' });
}

/**
 * Verify a JWT token and return decoded AuthPayload
 * Throws error if invalid or expired
 */
export function verifyToken(token: string, secret: Secret): AuthPayload {
  const decoded = jwt.verify(token, secret);

  if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded && 'role' in decoded) {
    return decoded as AuthPayload;
  }

  throw new Error('Invalid token payload structure');
}
