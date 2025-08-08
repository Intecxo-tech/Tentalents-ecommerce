// libs/shared/auth/scripts/generateToken.ts

import dotenv from 'dotenv';
import path from 'path';
import { signToken } from '../jwt';

// Load environment variables from root .env
dotenv.config({ path: path.resolve(__dirname, '../../../../..', '.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret';

if (!JWT_SECRET || JWT_SECRET === 'super_secret') {
  console.error('❌ JWT_SECRET not set correctly in .env');
  process.exit(1);
}

// Define your custom payload
const payload = {
  userId: 'abc123',
  email: 'admin@example.com',
  role: 'super_admin',
};

const token = signToken(payload, JWT_SECRET, '1h');

console.log('\n🔐 Generated JWT Token:\n');
console.log(token);

console.log('\n👉 Use in Authorization header:\n');
console.log(`Authorization: Bearer ${token}`);
