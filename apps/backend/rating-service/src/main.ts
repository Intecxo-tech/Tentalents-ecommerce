import dotenv from 'dotenv';
import path from 'path';
import app from './app';
import { createTopicsIfNotExists } from '@shared/middlewares/kafka/src/lib/kafka-admin';
import { PrismaClient } from '../generated/rating-service';
import { redisClient, connectRedis } from '@shared/redis';
import {
  connectKafkaProducer,
  disconnectKafkaProducer,
  connectKafkaConsumer,
  disconnectKafkaConsumer,
  KafkaConsumerConfig,
} from '@shared/kafka';
import { logger } from '@shared/logger';
import { KAFKA_TOPICS } from '@shared/constants';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT || 3003;
const prisma = new PrismaClient();

const kafkaConfig: KafkaConsumerConfig = {
  groupId: 'rating-service',
  topics: [KAFKA_TOPICS.PRODUCT_UPDATED],
};

const kafkaMessageHandler = async (message: string): Promise<void> => {
  logger.info(`[Kafka] 📨 Received: ${message}`);
  try {
    const event = JSON.parse(message);
    logger.info(`🔧 Handling rating event:`, event);

    // TODO: Add specific rating logic based on `event`
  } catch (err) {
    logger.error('❌ Failed to parse rating message:', err);
  }
};

let server: ReturnType<typeof app.listen> | null = null;

async function start() {
  try {
    logger.info('🚀 Starting Rating Service...');

    await connectRedis();
    logger.info('✅ Redis connected');

    await prisma.$connect();
    logger.info('✅ PostgreSQL connected');

    await createTopicsIfNotExists(kafkaConfig.topics);
    logger.info('✅ Kafka topics created or verified');

    await connectKafkaProducer();
    logger.info('✅ Kafka producer connected');

    await connectKafkaConsumer(kafkaConfig, kafkaMessageHandler);
    logger.info('✅ Kafka consumer connected');

    server = app.listen(PORT, () => {
      logger.info(`🌟 Rating Service running at http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('❌ Error during startup:', error);
    await shutdown(1);
  }
}

async function shutdown(exitCode = 0) {
  logger.info('🛑 Shutting down Rating Service...');
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
        process.exit(exitCode);
      });
    } else {
      process.exit(exitCode);
    }
  } catch (err) {
    logger.error('❌ Error during shutdown:', err);
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

start();
