import dotenv from 'dotenv';
import path from 'path';
import app from './app';
import { PrismaClient } from '@prisma/client';
import { logger } from '@shared/logger';
import { connectRedis, redisClient } from '@shared/redis';
import { createTopicsIfNotExists } from '@shared/kafka';
import {
  connectKafkaConsumer,
  disconnectKafkaConsumer,
  KafkaConsumerConfig,
} from '@shared/kafka';

// 🔧 Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 🛠️ Setup
const PORT = process.env.PORT || 3002;
const prisma = new PrismaClient();

// 🔌 Kafka Config
const kafkaConfig: KafkaConsumerConfig = {
  groupId: 'order-service',
  topics: ['order.created', 'payment.successful'], // update based on actual events
};

// 📩 Kafka Message Handler
async function kafkaMessageHandler(message: string): Promise<void> {
  logger.info(`[Kafka] 📨 Received message: ${message}`);

  try {
    const parsed = JSON.parse(message);

    // TODO: Handle events appropriately
    if (parsed.topic === 'order.created') {
      // await handleOrderCreated(parsed.payload);
    }

    if (parsed.topic === 'payment.successful') {
      // await handlePaymentSuccess(parsed.payload);
    }
  } catch (err) {
    logger.error('❌ Failed to handle Kafka message:', err);
  }
}

// 🌐 HTTP server reference
let server: ReturnType<typeof app.listen> | null = null;

// 🚀 Start service
async function start() {
  try {
    logger.info('🚀 Starting Order Service...');

    await connectRedis();
    logger.info('✅ Redis connected');

    await prisma.$connect();
    logger.info('✅ PostgreSQL connected');

    try {
      await connectKafkaConsumer(kafkaConfig, kafkaMessageHandler);
      logger.info('✅ Kafka consumer connected');
    } catch (kafkaErr) {
      logger.warn('⚠️ Kafka connection failed. Continuing without Kafka.');
      logger.warn(kafkaErr);
    }

    server = app.listen(PORT, () => {
      logger.info(`🛒 Order Service running at http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error('❌ Failed to start Order Service:', err);
    await shutdown(1);
  }
}


// 🧹 Graceful Shutdown
async function shutdown(exitCode = 0) {
  logger.info('🛑 Shutting down Order Service...');

  try {
    await prisma.$disconnect();

    if (redisClient.isOpen) {
      await redisClient.quit();
      logger.info('✅ Redis disconnected');
    }

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

// 🪦 Handle process signals
process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

// 🔥 Start app
start();
