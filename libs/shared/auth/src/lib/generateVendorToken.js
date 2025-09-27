// libs/shared/auth/src/lib/generateVendorToken.js

const dotenv = require('dotenv');
const path = require('path');
const { signToken } = require('./jwt'); // Your shared JWT helper

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../../../..', '.env') });

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET not set correctly in .env');
  process.exit(1);
}

// Vendor payload (replace IDs with real DB values)
const payload = {
  userId: '7bef3f6e-769e-4fc6-bd8e-c51dbd4d6337',   // vendor userId
  vendorId: 'b7c17387-c8bb-405d-b583-23fb928bfb3e', // vendorId from DB
  email: 'helotune258@gmail.com',
  role: 'SELLER', // ✅ hardcoded string instead of enum
};

// Sign token **without expiration**
const token = signToken(payload, JWT_SECRET, undefined); // no expiry = permanent

console.log('\n🔐 Generated Permanent Vendor JWT Token:\n');
console.log(token);
console.log('\n👉 Use in Authorization header:\n');
console.log(`Authorization: Bearer ${token}\n`);

// Usage:
// node libs/shared/auth/src/lib/generateVendorToken.js
// Copy the token output for curl or API testing




// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3YmVmM2Y2ZS03NjllLTRmYzYtYmQ4ZS1jNTFkYmQ0ZDYzMzciLCJ2ZW5kb3JJZCI6ImI3YzE3Mzg3LWM4YmItNDA1ZC1iNTgzLTIzZmI5MjhiZmIzZSIsImVtYWlsIjoiaGVsb3R1bmUyNThAZ21haWwuY29tIiwicm9sZSI6IlNFTExFUiIsImlhdCI6MTc1ODk4MzYzMSwiZXhwIjoxNzU4OTg3MjMxfQ.Txd6NkafZQNeaC1XzxnZaKqa90UzUnov-VB95mZXIz0