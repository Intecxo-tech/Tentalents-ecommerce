require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function testEmail() {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: 'your_email@example.com', // test email
      subject: 'Test Email',
      text: 'This is a test email from Node.js using SendGrid SMTP',
    });
    console.log('✅ Email sent:', info.messageId);
  } catch (err) {
    console.error('❌ Error sending email:', err);
  }
}

testEmail();
