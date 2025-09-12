import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SMTP_PASS, // use your .env variable
  },
});

async function testEmail() {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: 'your_email@example.com', // change to your test email
      subject: 'Test SMTP',
      text: 'This is a test email from Node.js',
    });
    console.log('✅ Email sent successfully');
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
}

testEmail();
