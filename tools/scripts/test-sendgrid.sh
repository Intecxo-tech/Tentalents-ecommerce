#!/bin/bash

# Make sure Node.js is installed
if ! command -v node &> /dev/null
then
    echo "Node.js is required but not installed. Exiting."
    exit 1
fi

# Create a temporary Node.js script
cat << 'EOF' > test-sendgrid.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.sendMail({
  from: process.env.EMAIL_FROM,
  to: 'swapnaadhav123@gmail.com',
  subject: 'Test Email',
  text: 'This is a test email from SendGrid SMTP!',
})
.then(() => console.log('✅ Email sent successfully!'))
.catch(err => console.error('❌ Error sending email:', err));
EOF

# Run the Node.js script
node test-sendgrid.js


