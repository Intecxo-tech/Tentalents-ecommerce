import nodemailer from 'nodemailer';
import { env } from '@shared/middlewares/config/src/lib/env';
import { logger } from '@shared/middlewares/logger/src/lib/logger';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({
  to,
  subject,
  html,
}: EmailPayload): Promise<void> => {
  const from = env.EMAIL_FROM;
  try {
    const info = await transporter.sendMail({ from, to, subject, html });
    logger.info(`📧 Email sent: ${info.messageId}`);
  } catch (err) {
    logger.error('❌ Failed to send email', err);
    throw err;
  }
};

// npm install -D @types/nodemailer
// npm install nodemailer