// test-email.js

// Load environment variables from .env
require('dotenv').config();

// Import the sendEmail function from your shared email library
const { sendEmail } = require('./dist/libs/shared/email');

// Change this to your email for testing
const TEST_RECIPIENT = 'swapnaadhav123@gmail.com';

// Choose which account to use: 'TEAM' or 'SWAPNA'
const ACCOUNT = 'SWAPNA'; // or 'TEAM'

// Select credentials dynamically
const SMTP_CONFIG =
  ACCOUNT === 'SWAPNA'
    ? {
        host: process.env.SWAPNA_SMTP_HOST,
        port: Number(process.env.SWAPNA_SMTP_PORT),
        user: process.env.SWAPNA_SMTP_USER,
        pass: process.env.SWAPNA_SMTP_PASS,
        from: process.env.SWAPNA_EMAIL_FROM,
      }
    : {
        host: process.env.TEAM_SMTP_HOST,
        port: Number(process.env.TEAM_SMTP_PORT),
        user: process.env.TEAM_SMTP_USER,
        pass: process.env.TEAM_SMTP_PASS,
        from: process.env.TEAM_EMAIL_FROM,
      };

(async () => {
  try {
    const result = await sendEmail({
      to: TEST_RECIPIENT,
      from: SMTP_CONFIG.from,
      subject: `✅ Test Email from shared/email (${ACCOUNT})`,
      html: '<h3>It works! 🎉</h3>',
      smtp: SMTP_CONFIG, // Pass SMTP config dynamically
    });

    console.log('📧 Email sent successfully:', result);
  } catch (err) {
    console.error('❌ Failed to send email:', err);
  }
})();
