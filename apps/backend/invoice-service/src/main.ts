import dotenv from 'dotenv';
import path from 'path';
import app from './app';

import { PrismaClient } from '@prisma/client';
import { logger } from '@shared/logger';
import { connectRedis, redisClient } from '@shared/redis';
import {
  connectKafkaConsumer,
  disconnectKafkaConsumer,
  KafkaConsumerConfig,
} from '@shared/kafka';
import { minioClient, MinioBuckets } from '@shared/minio';
import { invoiceService } from './app/services/invoice.service'; // <-- Import invoice service

// 🛠️ Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 🔧 Setup
const PORT = process.env.PORT || 3009;
const prisma = new PrismaClient();

// 📨 Kafka Config
const kafkaConfig: KafkaConsumerConfig = {
  groupId: 'invoice-service',
  topics: ['order.created'], // listen to order creation
};

// 💼 Kafka Message Handler
async function kafkaMessageHandler(message: string): Promise<void> {
  try {
    const orderEvent = JSON.parse(message);

    logger.info(`🧾 Received order.created event for orderId: ${orderEvent.id}`);

    // Automatically generate invoice for the order
    const result = await invoiceService.generateInvoice(orderEvent.id);

    logger.info(`✅ Invoice generated for orderId: ${orderEvent.id}`);
    logger.info(`📄 PDF URL: ${result.cloudinaryUrl}`);
  } catch (err) {
    logger.error('❌ Failed to process Kafka message:', err);
  }
}

// 🌐 HTTP Server
let server: ReturnType<typeof app.listen> | null = null;

async function start() {
  try {
    logger.info('🚀 Starting Invoice Service...');

    // 🧠 Redis
    await connectRedis();
    logger.info('✅ Redis connected');

    // 🛢️ PostgreSQL
    await prisma.$connect();
    logger.info('✅ PostgreSQL connected');

    // 📨 Kafka
    await connectKafkaConsumer(kafkaConfig, kafkaMessageHandler);
    logger.info('✅ Kafka consumer connected');

    // 🪣 MinIO Bucket
    const exists = await minioClient.bucketExists(MinioBuckets.INVOICE);
    if (!exists) {
      await minioClient.makeBucket(MinioBuckets.INVOICE);
      logger.info(`📦 Created MinIO bucket: ${MinioBuckets.INVOICE}`);
    } else {
      logger.info(`📦 MinIO bucket exists: ${MinioBuckets.INVOICE}`);
    }

    // 🌍 Start Express server
    server = app.listen(PORT, () => {
      logger.info(`📄 Invoice Service running at http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error('❌ Startup error:', err);
    await shutdown(1);
  }
}

// 🧼 Graceful Shutdown
async function shutdown(exitCode = 0) {
  logger.info('🛑 Shutting down Invoice Service...');
  try {
    await prisma.$disconnect();
    if (redisClient.isReady) {
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

// 🔌 Handle process signals
process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

// 🚀 Start the service
start();
