const dotenv = require('dotenv');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

dotenv.config({ path: path.resolve(__dirname, '../../../../..', '.env') });

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET not set in .env');
  process.exit(1);
}

const prisma = new PrismaClient();

// Self-contained ROLES enum
const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  VENDOR: 'vendor',
};

// JWT signing function with no expiration
function signTokenPermanent(payload, secret = JWT_SECRET) {
  return jwt.sign(payload, secret); // no expiresIn = permanent
}

async function generateAdminToken(email) {
  if (!email) throw new Error('Email must be provided');

  try {
    let user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      console.log('Admin user not found. Creating dummy admin...');
      user = await prisma.user.create({
        data: { email, role: ROLES.ADMIN },
      });
      console.log('Dummy admin created:', user.email);
    }

    const payload = { userId: user.id, email: user.email, role: ROLES.ADMIN };
    const token = signTokenPermanent(payload, JWT_SECRET);

    await prisma.userToken.create({
      data: { token, userId: user.id, revoked: false, createdAt: new Date() },
    });

    console.log('\n🔐 Permanent Admin JWT Token:\n', token);
    console.log(`Authorization: Bearer ${token}`);
    return token;
  } finally {
    await prisma.$disconnect();
  }
}

// Use email argument or default
const emailArg = process.argv[2] || 'admin@example.com';
(async () => {
  await generateAdminToken(emailArg);
})();
