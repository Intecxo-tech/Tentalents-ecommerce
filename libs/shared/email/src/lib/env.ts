export const env = {
  NODE_ENV:
    (process.env.NODE_ENV as 'development' | 'production' | 'test') ||
    'development',
  PORT: parseInt(process.env.PORT || '3000', 10),

  // PostgreSQL
  POSTGRES_HOST: process.env.POSTGRES_HOST || '',
  POSTGRES_PORT: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  POSTGRES_DB: process.env.POSTGRES_DB || '',
  POSTGRES_USER: process.env.POSTGRES_USER || '',
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || '',

  // Redis
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),

  // Kafka
  KAFKA_BROKER: process.env.KAFKA_BROKERS || 'localhost:9092',
  KAFKA_CLIENT_ID: process.env.KAFKA_CLIENT_ID || '',
  KAFKA_GROUP_ID: process.env.KAFKA_GROUP_ID || '',

  // SMTP (Email)
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@mvp-shop.com',

  // ImageKit
  IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT || '',
  IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY || '',
  IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY || '',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_jwt_secret',

  // MinIO
  MINIO_ENDPOINT: process.env.MINIO_ENDPOINT || 'localhost',
  MINIO_PORT: Number(process.env.MINIO_PORT) || 9000,
  MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY || '',
  MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY || '',
  MINIO_BUCKET_NAME: process.env.MINIO_BUCKET_NAME || 'invoices',

  // ✅ Service Name
  SERVICE_NAME: process.env.SERVICE_NAME || 'unknown-service',
};
