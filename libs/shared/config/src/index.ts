// libs/shared/config/src/index.ts

// Export all shared helpers / configs
export * from './lib/env';
export * from './lib/postgres';
export * from './lib/redis';
export * from './lib/kafka';
export * from './lib/jwt';
export * from './lib/smtp';
export * from './lib/minio';
export * from './lib/imagekit';
export * from './lib/types';
export * from './lib/config';

// Optional: centralized config object using validated env
import { env } from './lib/env';

export const config = {
  JWT_SECRET: env.JWT_SECRET || 'supersecret', // comes from validated env
  service: {
    port: env.PORT,
  },
  SMTP: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
};
