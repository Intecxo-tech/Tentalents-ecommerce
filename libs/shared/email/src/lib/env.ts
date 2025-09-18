// libs/shared/email/src/lib/env.ts
export const emailEnv = {
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER || 'apikey',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@example.com',
};
