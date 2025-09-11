import { Kafka } from 'kafkajs';
import { getKafkaInstance } from './kafka-client';

export async function createTopicsIfNotExists(topics: string[]): Promise<void> {
  const kafka: Kafka = getKafkaInstance();
  const admin = kafka.admin();

  try {
    await admin.connect();
    console.info('[Kafka Admin] Connected to Kafka admin client');

    const existingTopics: string[] = await admin.listTopics();
    const topicsToCreate = topics.filter(topic => !existingTopics.includes(topic));

    if (topicsToCreate.length === 0) {
      console.info('[Kafka Admin] All topics already exist');
      return;
    }

    await admin.createTopics({
      topics: topicsToCreate.map(topic => ({
        topic,
        numPartitions: 1, // Adjust as needed
        // replicationFactor: 1, // Optional: omit for Redpanda Serverless
      })),
      waitForLeaders: true,
    });

    console.info(`[Kafka Admin] Created topics: ${topicsToCreate.join(', ')}`);
  } catch (error) {
    console.error('[Kafka Admin] Failed to create topics:', error);
    throw error;
  } finally {
    await admin.disconnect();
    console.info('[Kafka Admin] Disconnected from Kafka admin client');
  }
}
