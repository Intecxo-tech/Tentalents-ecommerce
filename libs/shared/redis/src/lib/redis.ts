import { createClient } from 'redis';

export const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
  password: process.env.REDIS_PASSWORD,
});

redisClient.on('error', (err: Error) => console.error('❌ Redis Error:', err));

export async function connectRedis(): Promise<void> {
  if (redisClient.isOpen) {
    console.log('⚠️ Redis connection already open, skipping connect.');
    return;
  }

  await redisClient.connect();
  console.log('✅ Redis connected');
}

export async function disconnectRedis(): Promise<void> {
  if (!redisClient.isOpen) {
    console.log('⚠️ Redis connection already closed, skipping disconnect.');
    return;
  }
  await redisClient.quit();
  console.log('🔌 Redis disconnected');
}
