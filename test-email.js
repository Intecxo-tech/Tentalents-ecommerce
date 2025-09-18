// test-email.js

// Load environment variables from .env.sendgrid
require('dotenv').config({ path: '.env.sendgrid' });

const nodemailer = require('nodemailer');

// Recipient email for testing
const TEST_RECIPIENT = 'swapnaadhav123@gmail.com';

// Create SMTP transporter using SendGrid credentials
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT === '465', // true for port 465, false otherwise
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// HTML email content
const htmlContent = `
<html>
  <body>
    <h1 style="color: #4CAF50;">SendGrid SMTP Test ✅</h1>
    <p>This is a <strong>test email</strong> sent via <em>SendGrid SMTP</em> using Node.js.</p>
    <p style="color: #888;">Have a nice day! 🌟</p>
  </body>
</html>
`;

// Email options
const mailOptions = {
  from: process.env.EMAIL_FROM,
  to: TEST_RECIPIENT,
  subject: '✅ SendGrid HTML Test Email',
  html: htmlContent,
};

// Send the email
(async () => {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('❌ Failed to send email:', error);
  }
})();
