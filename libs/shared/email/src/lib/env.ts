// import * as path from 'path';
// import * as fs from 'fs';
// import * as dotenv from 'dotenv';

// const envPath = path.resolve(__dirname, '../../../../.env.sendgrid');

// if (fs.existsSync(envPath)) {
//   dotenv.config({ path: envPath });
//   console.log('📧 Loaded .env.sendgrid from', envPath);
// } else {
//   console.warn('⚠️ .env.sendgrid not found; using process.env instead');
// }

// export const emailEnv = {
//   SMTP_HOST: process.env.SMTP_HOST || 'smtp.sendgrid.net',
//   SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
//   SMTP_USER: process.env.SMTP_USER || 'apikey',
//   SMTP_PASS: process.env.SMTP_PASS || '',  // Must be set
//   EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@example.com',
// };

// console.log('📧 emailEnv loaded:', {
//   SMTP_USER: emailEnv.SMTP_USER,
//   SMTP_PASS_SET: !!emailEnv.SMTP_PASS,
// });



// libs/shared/email/src/lib/env.ts
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// 1️⃣ Load main .env (app-wide variables)
const mainEnvPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(mainEnvPath)) {
  dotenv.config({ path: mainEnvPath });
  console.log('🌱 Loaded .env from', mainEnvPath);
}

// 2️⃣ Load .env.sendgrid (overrides email-specific variables)
const sendgridEnvPath = path.resolve(process.cwd(), '.env.sendgrid');
if (fs.existsSync(sendgridEnvPath)) {
  dotenv.config({ path: sendgridEnvPath, override: true });
  console.log('📧 Loaded .env.sendgrid from', sendgridEnvPath);
} else {
  console.warn('⚠️ .env.sendgrid not found; using process.env values');
}

// 3️⃣ Export combined email environment
export const emailEnv = {
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER || 'apikey',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@example.com',
};

// 4️⃣ Debug to confirm loaded values
console.log('📧 emailEnv loaded:', {
  SMTP_USER: emailEnv.SMTP_USER,
  SMTP_PASS_SET: !!emailEnv.SMTP_PASS,
  EMAIL_FROM: emailEnv.EMAIL_FROM,
});
