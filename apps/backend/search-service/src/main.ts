import dotenv from 'dotenv';
import path from 'path';
import app from './app';

import { PrismaClient } from '@prisma/client';
import { connectRedis, redisClient } from '@shared/redis';
import {
  connectKafkaProducer,
  disconnectKafkaProducer,
  connectKafkaConsumer,
  disconnectKafkaConsumer,
  KafkaConsumerConfig,
} from '@shared/kafka';
import { logger } from '@shared/logger';

// 🔧 Load env variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT || 3006;
const prisma = new PrismaClient();

// 🧠 Kafka Config
const kafkaConfig: KafkaConsumerConfig = {
  groupId: 'search-service',
  topics: ['product.created', 'product.updated', 'product.deleted'],
};

// 🔄 Kafka Message Handler
const handleKafkaEvent = async (topic: string, payload: any): Promise<void> => {
  logger.info(
    `[Kafka] 🧠 Topic: ${topic} | Payload: ${JSON.stringify(payload)}`
  );
  // TODO: Implement syncing with Redis/Elasticsearch
};

const kafkaMessageHandler = async (message: string): Promise<void> => {
  try {
    const { topic, payload } = JSON.parse(message);
    await handleKafkaEvent(topic, payload);
  } catch (err) {
    logger.error('❌ Failed to parse or process Kafka message:', err);
  }
};

let server: ReturnType<typeof app.listen> | null = null;

// 🚀 Boot Service
async function start() {
  try {
    logger.info('🚀 Starting Search Service...');

    await connectRedis();
    logger.info('✅ Redis connected');

    await prisma.$connect();
    logger.info('✅ PostgreSQL connected');

    await connectKafkaProducer();
    logger.info('✅ Kafka Producer connected');

    await connectKafkaConsumer(kafkaConfig, kafkaMessageHandler);
    logger.info('✅ Kafka Consumer subscribed');

    server = app.listen(PORT, () => {
      logger.info(`🔎 Search Service running at http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error('❌ Startup error in Search Service:', err);
    await shutdown();
    process.exit(1);
  }
}

// 🛑 Shutdown Logic
async function shutdown() {
  logger.info('🛑 Shutting down Search Service...');
  try {
    await prisma.$disconnect();

    if (redisClient.isOpen) {
      await redisClient.quit();
      logger.info('✅ Redis disconnected');
    }

    await disconnectKafkaProducer();
    await disconnectKafkaConsumer();

    if (server) {
      server.close(() => {
        logger.info('✅ HTTP server closed');
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

// 🧼 OS Signal Handlers
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();
