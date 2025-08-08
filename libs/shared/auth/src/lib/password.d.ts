/**
 * Hashes a plain-text password using bcrypt
 */
export declare function hashPassword(password: string): Promise<string>;
/**
 * Compares a plain-text password with a hashed password
 */
export declare function comparePassword(password: string, hashed: string): Promise<boolean>;
//# sourceMappingURL=password.d.ts.map