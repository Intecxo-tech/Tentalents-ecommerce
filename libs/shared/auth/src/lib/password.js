import bcrypt from 'bcrypt';
const SALT_ROUNDS = 10;
/**
 * Hashes a plain-text password using bcrypt
 */
export async function hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
}
/**
 * Compares a plain-text password with a hashed password
 */
export async function comparePassword(password, hashed) {
    return bcrypt.compare(password, hashed);
}
//# sourceMappingURL=password.js.map