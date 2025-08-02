import dotenv from 'dotenv';
import path from 'path';
import app from './app';
import { PrismaClient } from '@prisma/client';
import { connectRedis, disconnectRedis, redisClient } from '@shared/middlewares/redis/src/index';
import {
  connectKafkaProducer,
  disconnectKafkaProducer,
  connectKafkaConsumer,
  disconnectKafkaConsumer,
  KafkaConsumerConfig,
} from '@shared/middlewares/kafka/src/index';

import { logger } from '@shared/middlewares/logger/src/index';

// 📦 Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../../../.env') });

const PORT = process.env.PORT || 3010;
const prisma = new PrismaClient();

// 🧩 Kafka configuration
const kafkaConfig: KafkaConsumerConfig = {
  groupId: 'coupon-service',
  topics: ['coupon.created', 'coupon.updated', 'coupon.expired'], // Add coupon-related topics here
};

// 📨 Kafka message handler
const onMessage = async (topic: string, payload: any): Promise<void> => {
  logger.info(`[Kafka] [${topic}] Received in Coupon Service`, payload);
  // TODO: Implement coupon-related logic based on events
};

const kafkaMessageHandler = async (message: string): Promise<void> => {
  try {
    const { topic, payload } = JSON.parse(message);
    try {
      await onMessage(topic, payload);
    } catch (err) {
      logger.error(`❌ Error processing Kafka message on topic ${topic}:`, err);
    }
  } catch (err) {
    logger.error('❌ Failed to parse Kafka message:', err);
  }
};

let server: ReturnType<typeof app.listen> | null = null;

async function start() {
  try {
    await connectRedis();
    logger.info('✅ Redis connected');
    console.log('✅ Redis connected');


    await prisma.$connect();
    logger.info('✅ PostgreSQL connected');
    console.log('✅ PostgreSQL connected');

    await connectKafkaProducer();
    logger.info('✅ Kafka producer connected');

    await connectKafkaConsumer(kafkaConfig, kafkaMessageHandler);
    logger.info('✅ Kafka consumer subscribed');

    server = app.listen(PORT, () => {

    console.log(`🚀 Coupon Service running at http://localhost:${PORT}`);
  logger.info(`🚀 Coupon Service running at http://localhost:${PORT}`);
  logger.info(`📚 Swagger docs available at http://localhost:${PORT}/api/docs/coupon`);
    });
  } catch (err) {
    logger.error('❌ Failed to start Coupon Service:', err);
    await shutdown();
    process.exit(1);
  }
}

async function shutdown() {
  logger.info('🛑 Shutting down Coupon Service...');
  try {
    await prisma.$disconnect();

    if (redisClient.isOpen) {
      await redisClient.quit();
      logger.info('✅ Redis disconnected');
    }

    await disconnectKafkaProducer();
    await disconnectKafkaConsumer();
    await disconnectRedis();

    if (server) {
      server.close(() => {
        logger.info('✅ Server closed gracefully');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  } catch (err) {
    logger.error('❌ Error during shutdown:', err);
    process.exit(1);
  }
}

// 🧼 Graceful shutdown
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);


start();
