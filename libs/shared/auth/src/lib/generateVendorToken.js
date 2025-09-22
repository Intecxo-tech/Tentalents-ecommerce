const dotenv = require('dotenv');
const path = require('path');
const { signToken } = require('./jwt'); // adjust import if your helper path differs
const { ROLES } = require('./types');    // ensure ROLES.VENDOR exists

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../../..', '.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret';

if (!JWT_SECRET || JWT_SECRET === 'super_secret') {
  console.error('❌ JWT_SECRET not set correctly in .env');
  process.exit(1);
}

// Vendor Swapna A payload
const payload = {
  userId: '8e36d8c4-40ac-4bde-968f-4b40721cd5d2',   // linked user ID
  vendorId: 'b7c17387-c8bb-405d-b583-23fb928bfb3e', // vendor's actual ID
  email: 'swapnaadhav123@gmail.com',
  role: ROLES.VENDOR,
};

// Permanent token (no expiration)
const token = signToken(payload, JWT_SECRET);

console.log('\n🔐 Generated Vendor JWT Token (Permanent) for Swapna A:\n');
console.log(token);

console.log('\n👉 Use in Authorization header:\n');
console.log(`Authorization: Bearer ${token}`);


// node libs/shared/auth/src/lib/generateVendorToken.js