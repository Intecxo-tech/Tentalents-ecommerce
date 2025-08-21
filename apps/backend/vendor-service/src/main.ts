import dotenv from 'dotenv';
import path from 'path';
import { Server } from 'http';
import app from './app';
import { createTopicsIfNotExists } from '@shared/kafka';
import { logger } from '@shared/logger';
import { config } from '@shared/config';
import { connectRedis, disconnectRedis } from '@shared/redis';
import {
      // ✅ Import this
  connectKafkaProducer,
  disconnectKafkaProducer
} from '@shared/kafka';
import { getKafkaInstance } from '@shared/kafka';
import { kafkaConfig } from '@shared/kafka'; // ✅ Import your Kafka config
import { connectMinio, disconnectMinio } from '@shared/minio';

// 🌍 Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const PORT = parseInt(process.env.PORT || '3010', 10);

async function start() {
  let server: Server | undefined;

  try {
    // Initialize Kafka instance
    getKafkaInstance();

    // Create topics on Redpanda Cloud before anything else
    await createTopicsIfNotExists([
      'user.created',
      'user.updated',
      'order.created',
      // add your actual topics here
    ]);

    // Connect external dependencies AFTER topics are created
    await Promise.all([
      connectKafkaProducer(),
      connectRedis(),
      connectMinio(),
    ]);
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});
    // Start server
logger.info(`Starting server on port ${PORT} and binding to 0.0.0.0`);
server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server is listening on http://0.0.0.0:${PORT}`);
});

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('🛑 Gracefully shutting down Vendor Service...');
      try {
        await Promise.all([
          disconnectKafkaProducer(),
          disconnectRedis(),
          disconnectMinio(),
        ]);

        server?.close(() => {
          logger.info('✅ Vendor Service shut down cleanly');
          process.exit(0);
        });
      } catch (err) {
        logger.error('❌ Error during shutdown:', err);
        process.exit(1);
      }
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (err) {
    logger.error('❌ Failed to start Vendor Service:', err);
    process.exit(1);
  }
}


start();
