import { SignOptions, Secret } from 'jsonwebtoken';
import { AuthPayload } from './types';
/**
 * Sign a JWT token with AuthPayload
 */
export declare function signToken(payload: AuthPayload, secret: Secret, expiresIn?: SignOptions['expiresIn']): string;
export declare function generateJWT(payload: AuthPayload): string;
export declare function generateRefreshToken(payload: {
    userId: string;
}): string;
/**
 * Verify a JWT token and return decoded AuthPayload
 * Throws error if invalid or expired
 */
export declare function verifyToken(token: string, secret: Secret): AuthPayload;
//# sourceMappingURL=jwt.d.ts.map