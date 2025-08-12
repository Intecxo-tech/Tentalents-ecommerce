import dotenv from 'dotenv';
import path from 'path';
import app from './app';
import { PrismaClient } from '@prisma/client';
import { connectRedis, redisClient } from '@shared/redis';
import { createTopicsIfNotExists } from '@shared/middlewares/kafka/src/lib/kafka-admin';

import {
  connectKafkaProducer,
  connectKafkaConsumer,
  disconnectKafkaProducer,
  disconnectKafkaConsumer,
  KafkaConsumerConfig,
  KAFKA_TOPICS,
} from '@shared/kafka';
import { logger } from '@shared/logger';


// 🧪 Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = parseInt(process.env.PORT || '3008', 10);
const prisma = new PrismaClient();

// 🔄 Extract all topic strings from nested KAFKA_TOPICS
const extractAllTopics = (topicsObj: Record<string, any>): string[] => {
  const flat: string[] = [];
  for (const category of Object.values(topicsObj)) {
    if (typeof category === 'object') {
      flat.push(...(Object.values(category) as string[]));
    }
  }
  return flat;
};

const kafkaConfig: KafkaConsumerConfig = {
  groupId: 'admin-service',
  topics: extractAllTopics(KAFKA_TOPICS),
};

// 🎯 Kafka Topic Event Dispatcher
const onMessage = async (topic: string, payload: any): Promise<void> => {
  try {
    switch (topic) {
      case KAFKA_TOPICS.USER.CREATED:
        logger.info(`[Kafka] 🧑 User created`);
        break;

      case KAFKA_TOPICS.ORDER.CREATED:
        logger.info(`[Kafka] 📦 Order created`);
        break;

      case KAFKA_TOPICS.EMAIL.USER_CREATED:
        logger.info(`[Kafka] 📧 Send welcome email`);
        break;

      default:
        logger.warn(`[Kafka] ❓ No handler for topic: ${topic}`);
        logger.debug(`[Kafka] Payload: ${JSON.stringify(payload, null, 2)}`);
    }
  } catch (err) {
    logger.error(`[Kafka] ❌ Handler error for topic "${topic}"`, err);
  }
};

// 📨 Kafka Raw Message Parser
const kafkaMessageHandler = async (message: unknown) => {
  try {
    if (typeof message !== 'string') {
      logger.warn('[Kafka] ⚠️ Received non-string message');
      return;
    }

    const parsed = JSON.parse(message);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('topic' in parsed) ||
      !('payload' in parsed)
    ) {
      logger.warn('[Kafka] ⚠️ Invalid message format');
      return;
    }

    const { topic, payload } = parsed as { topic: string; payload: any };
    await onMessage(topic, payload);
  } catch (err) {
    logger.error('[Kafka] ❌ Failed to handle message', err);
  }
};

let server: ReturnType<typeof app.listen> | null = null;
let isShuttingDown = false;

// 🚀 Boot Function
async function start() {
  try {
    logger.info('🔧 Initializing Admin Service dependencies...');

    if (kafkaConfig.topics.length === 0) {
      logger.warn('[Kafka] ⚠️ No topics configured for consumer');
    }

    await connectRedis();
    logger.info('✅ Redis connected');

    // <<< Add topic creation here before producer/consumer connects
    await createTopicsIfNotExists(kafkaConfig.topics);
    logger.info('✅ Kafka topics created or verified');

    await connectKafkaProducer();
    logger.info('✅ Kafka producer connected');

    await connectKafkaConsumer(kafkaConfig, kafkaMessageHandler);
    logger.info('✅ Kafka consumer connected');

    server = app.listen(PORT, () => {
      logger.info(`🚀 Admin Service running at http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error('❌ Startup failed:', err);
    await shutdown();
    process.exit(1);
  }
}


// 🧹 Graceful Shutdown
async function shutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info('🛑 Gracefully shutting down Admin Service...');

  const shutdownTimeout = setTimeout(() => {
    logger.error('⏳ Forced shutdown after timeout');
    process.exit(1);
  }, 10000); // 10s timeout

  try {
    await prisma.$disconnect();
    logger.info('✅ Prisma disconnected');

    if (typeof redisClient?.status === 'string' && redisClient.status !== 'end') {
  await redisClient.quit();
  logger.info('✅ Redis disconnected');
}

    await disconnectKafkaProducer();
    await disconnectKafkaConsumer();
    logger.info('✅ Kafka disconnected');

    if (server) {
      server.close(() => {
        logger.info('✅ HTTP server closed');
        clearTimeout(shutdownTimeout);
        process.exit(0);
      });
    } else {
      clearTimeout(shutdownTimeout);
      process.exit(0);
    }
  } catch (err) {
    logger.error('❌ Shutdown error:', err);
    clearTimeout(shutdownTimeout);
    process.exit(1);
  }
}

// 🛡 Global Exception & Signal Handling
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('unhandledRejection', (reason) => {
  logger.error('❌ Unhandled Rejection:', reason);
  shutdown();
});
process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception:', error);
  shutdown();
});

// 🟢 Start the service
start();
