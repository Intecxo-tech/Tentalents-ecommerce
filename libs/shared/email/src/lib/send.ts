// libs/shared/email/src/lib/send.ts
import nodemailer from 'nodemailer';
import { emailEnv } from './env';
import { emailLogger } from './logger';
import { EmailPayload } from './types';

const transporter = nodemailer.createTransport({
  host: emailEnv.SMTP_HOST,
  port: emailEnv.SMTP_PORT,
  secure: emailEnv.SMTP_PORT === 465, // TLS for port 465
  auth: {
    user: emailEnv.SMTP_USER,
    pass: emailEnv.SMTP_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }: EmailPayload) => {
  try {
    const info = await transporter.sendMail({
      from: `"MVP E-Commerce" <${emailEnv.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
    emailLogger.info(`📧 Email sent: ${info.messageId}`);
    return { messageId: info.messageId };
  } catch (err) {
    emailLogger.error('❌ Failed to send email', err);
    throw err;
  }
};
