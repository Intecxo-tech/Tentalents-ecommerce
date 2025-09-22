
import dotenv from 'dotenv';
import path from 'path';
import { signToken } from './jwt'; // your JWT helper

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../../../..', '.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret';

if (!JWT_SECRET || JWT_SECRET === 'super_secret') {
  console.error('❌ JWT_SECRET not set correctly in .env');
  process.exit(1);
}

// Admin payload
const payload = {
  userId: 'abc123',         // You can use the real admin user ID from DB
  email: 'admin@example.com',
  role: 'super_admin',       // Or 'admin' if you follow your UserRole enum
};

// Sign token (expires in 1 hour)
const token = signToken(payload, JWT_SECRET, '1h');

console.log('\n🔐 Generated JWT Token:\n');
console.log(token);

console.log('\n👉 Use in Authorization header:\n');
console.log(`Authorization: Bearer ${token}`);


// node generate-Admin-Token.js
