import { Kafka } from 'kafkajs';
import { getKafkaInstance } from './kafka-client';
import { logger } from '@shared/middlewares/logger/src/index';

export async function createTopicsIfNotExists(topics: string[]) {
  const kafka = getKafkaInstance();
  const admin = kafka.admin();

  try {
    await admin.connect();
    logger.info('[Kafka Admin] Connected to Kafka admin client');

    const existingTopics = await admin.listTopics();

    const topicsToCreate = topics.filter(topic => !existingTopics.includes(topic));
    if (topicsToCreate.length === 0) {
      logger.info('[Kafka Admin] All topics already exist');
      return;
    }

    await admin.createTopics({
      topics: topicsToCreate.map(topic => ({
        topic,
        numPartitions: 1, // adjust as needed
        // replicationFactor: 1,  // optional: omit for Redpanda Serverless
      })),
      waitForLeaders: true,  // wait for leaders to be elected before proceeding
    });

    logger.info(`[Kafka Admin] Created topics: ${topicsToCreate.join(', ')}`);
  } catch (error) {
    logger.error('[Kafka Admin] Failed to create topics:', error);
    throw error;
  } finally {
    await admin.disconnect();
    logger.info('[Kafka Admin] Disconnected from Kafka admin client');
  }
}
