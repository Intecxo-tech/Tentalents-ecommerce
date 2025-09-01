import { createClient } from 'redis';
import { logger } from '@shared/logger';

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err: Error) => logger.error('❌ Redis Error:', err));

export async function connectRedis(): Promise<void> {
  if (redisClient.isOpen) {
    logger.info('⚠️ Redis connection already open, skipping connect.');
    return;
  }

  await redisClient.connect();
  logger.info('✅ Redis connected');
}

export async function disconnectRedis(): Promise<void> {
  if (!redisClient.isOpen) {
    logger.info('⚠️ Redis connection already closed, skipping disconnect.');
    return;
  }
  await redisClient.quit();
  logger.info('🔌 Redis disconnected');
}