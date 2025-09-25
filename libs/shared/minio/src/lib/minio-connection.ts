import minioClient from './minio-client';
import { logger } from './logger';

export async function connectMinio() {
  try {
    // This simply verifies connection by checking a bucket, or you can ping the server
    const bucket = 'vendor-files';
    const exists = await minioClient.bucketExists(bucket);
    if (!exists) {
      await minioClient.makeBucket(bucket, 'us-east-1');
      logger.info(`✅ Created bucket: ${bucket}`);
    } else {
      logger.info(`ℹ️ Bucket already exists: ${bucket}`);
    }
  } catch (err) {
    logger.error('❌ Error connecting to MinIO', err);
    throw err;
  }
}

// MinIO client does not need explicit disconnect, but provide a stub for symmetry
export async function disconnectMinio() {
  logger.info('ℹ️ MinIO client disconnect called (no-op)');
  // No actual disconnect method in MinIO SDK
}
