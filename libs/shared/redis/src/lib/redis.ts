// libs/shared/redis/src/lib/simple-redis.ts
import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://:redis_pass@localhost:6379';

export const redisClient = createClient({ url: REDIS_URL });

redisClient.on('error', (err: Error) => {
  console.error('❌ Redis Error:', err);
});

export async function connectRedis(): Promise<void> {
  if (redisClient.isOpen) return;
  await redisClient.connect();
  console.log('✅ Redis connected');
}

export async function disconnectRedis(): Promise<void> {
  if (!redisClient.isOpen) return;
  await redisClient.quit();
  console.log('🔌 Redis disconnected');
}
