import nodemailer from 'nodemailer';
import { EmailPayload } from './types';
import { env } from '@shared/middlewares/config/src';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST, // SendGrid SMTP: smtp.sendgrid.net
  port: env.SMTP_PORT, // Usually 587
  secure: env.SMTP_PORT === 465, // Use TLS for port 465
  auth: {
    user: env.SMTP_USER, // Typically "apikey" for SendGrid
    pass: env.SMTP_PASS, // Your SendGrid API key
  },
});

export const sendEmail = async ({
  to,
  subject,
  html,
}: EmailPayload): Promise<{ messageId: string }> => {
  const info = await transporter.sendMail({
    from: `"MVP E-Commerce" <${env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  });

  return { messageId: info.messageId };
};
