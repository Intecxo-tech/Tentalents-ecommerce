// // libs/shared/email/src/lib/send.ts
// import nodemailer from 'nodemailer';
// import { emailEnv } from './env';
// import { emailLogger } from './logger';
// import { EmailPayload } from './types';

// const transporter = nodemailer.createTransport({
//   host: emailEnv.SMTP_HOST,
//   port: emailEnv.SMTP_PORT,
//   secure: emailEnv.SMTP_PORT === 465, // TLS for port 465
//   auth: {
//     user: emailEnv.SMTP_USER,
//     pass: emailEnv.SMTP_PASS,
//   },
// });

// export const sendEmail = async ({ to, subject, html }: EmailPayload) => {
//   try {
//     const info = await transporter.sendMail({
//       from: `"MVP E-Commerce" <${emailEnv.EMAIL_FROM}>`,
//       to,
//       subject,
//       html,
//     });
//     emailLogger.info(`📧 Email sent: ${info.messageId}`);
//     return { messageId: info.messageId };
//   } catch (err) {
//     emailLogger.error('❌ Failed to send email', err);
//     throw err;
//   }
// };

// libs/shared/email/src/lib/send.ts
import nodemailer from 'nodemailer';
import { emailEnv } from './env';
import { emailLogger } from './logger';
import { EmailPayload } from './types';

// Create reusable SMTP transporter using combined env configuration
const transporter = nodemailer.createTransport({
  host: emailEnv.SMTP_HOST,
  port: emailEnv.SMTP_PORT,
  secure: emailEnv.SMTP_PORT === 465, // true for TLS port 465
  auth: {
    user: emailEnv.SMTP_USER,
    pass: emailEnv.SMTP_PASS,
  },
});

/**
 * Send an email using SendGrid SMTP
 * Supports HTML content and attachments
 */
export const sendEmail = async ({
  to,
  subject,
  html,
  attachments,
}: EmailPayload) => {
  try {
    const info = await transporter.sendMail({
      from: `"MVP E-Commerce" <${emailEnv.EMAIL_FROM}>`,
      to,
      subject,
      html,
      attachments, // optional array of attachments
    });

    emailLogger.info(`📧 Email sent successfully: ${info.messageId} to ${to}`);
    return { messageId: info.messageId };
  } catch (err) {
    emailLogger.error(`❌ Failed to send email to ${to}`, err);
    throw err;
  }
};
