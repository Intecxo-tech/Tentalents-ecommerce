// shared/email/client.ts
import nodemailer from 'nodemailer';
import { EmailPayload } from './types';

const env = {
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER || 'apikey',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'no-reply@example.com',
};

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465, // TLS for port 465
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const sendEmail = async (payload: EmailPayload): Promise<{ messageId: string }> => {
  try {
    const info = await transporter.sendMail({
      from: `"MVP E-Commerce" <${env.EMAIL_FROM}>`,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      attachments: payload.attachments,
    });

    console.log(`📧 Email sent: ${info.messageId}`);
    return { messageId: info.messageId };
  } catch (err) {
    console.error('❌ Failed to send email', err);
    throw err;
  }
};
