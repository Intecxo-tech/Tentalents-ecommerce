import dotenv from 'dotenv';
import path from 'path';
import app from './app';
import { createTopicsIfNotExists } from '@shared/middlewares/kafka/src/lib/kafka-admin';

import { PrismaClient } from '../generated/user-service';
import { connectRedis, redisClient } from '@shared/redis';
import {
  connectKafkaProducer,
  disconnectKafkaProducer,
  connectKafkaConsumer,
  disconnectKafkaConsumer,
  KafkaConsumerConfig,
} from '@shared/kafka';
import { logger } from '@shared/logger';

// 🔧 Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT || 3012;
const prisma = new PrismaClient();

// 🧭 Kafka Consumer Configuration
const kafkaConfig: KafkaConsumerConfig = {
  groupId: 'user-service',
  topics: ['user.updated'], // 🔄 Replace or expand based on user events
};

// 📨 Kafka Message Handler
const onMessage = async (topic: string, payload: any): Promise<void> => {
  logger.info(`[Kafka] 🔔 Received event on topic: ${topic}`, payload);
  // TODO: Implement user update handling logic
};

const kafkaMessageHandler = async (message: string): Promise<void> => {
  try {
    const { topic, payload } = JSON.parse(message);
    await onMessage(topic, payload);
  } catch (err) {
    logger.error('❌ Kafka message parsing failed:', err);
  }
};

let server: ReturnType<typeof app.listen> | null = null;

// 🚀 Start User Service
async function start() {
  try {
    logger.info('🔧 Initializing User Service...');

    // Redis
    await connectRedis();
    logger.info('✅ Redis connected');

    // <<< Add topic creation here before producer/consumer connects
    await createTopicsIfNotExists(kafkaConfig.topics);
    logger.info('✅ Kafka topics created or verified');

    await connectKafkaProducer();
    logger.info('✅ Kafka producer connected');

    await connectKafkaConsumer(kafkaConfig, kafkaMessageHandler);
    logger.info('✅ Kafka consumer connected');

    // PostgreSQL
    await prisma.$connect();
    logger.info('✅ PostgreSQL connected');

    // Express server
    server = app.listen(PORT, () => {
      logger.info(`🚀 User Service running at http://localhost:${PORT}`);
      logger.info(`📚 Swagger Docs available at /api/docs/user`);
    });
  } catch (err) {
    logger.error('❌ Failed to start User Service:', err);
    await shutdown();
    process.exit(1);
  }
}

// 🛑 Graceful Shutdown
async function shutdown() {
  logger.info('🛑 Shutting down User Service...');
  try {
    await prisma.$disconnect();
    logger.info('✅ PostgreSQL disconnected');

    if (redisClient.isOpen) {
      await redisClient.quit();
      logger.info('✅ Redis disconnected');
    }

    await disconnectKafkaProducer();
    await disconnectKafkaConsumer();

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

// 🧼 Handle termination signals
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// 🚀 Start the service
start();
