import nodemailer from 'nodemailer';

const env = {
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER || 'apikey',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'no-reply@example.com',
};

const logger = {
  info: (...args: any[]) => console.info(...args),
  error: (...args: any[]) => console.error(...args),
};

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
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


