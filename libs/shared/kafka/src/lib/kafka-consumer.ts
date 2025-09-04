import { Consumer, EachMessagePayload } from 'kafkajs';
import { getKafkaConsumer } from './kafka-client'; // ✅ Corrected import
import { logger } from '@shared/logger'; // Replace with console if needed

export interface KafkaConsumerConfig {
  groupId: string;
  topics: string[];
  handleMessage?: (topic: string, payload: EachMessagePayload) => Promise<void>;
}

/**
 * Starts Kafka consumer with topic subscriptions and message handler.
 */
export async function connectKafkaConsumer(
  config: KafkaConsumerConfig,
  onMessage?: (message: string) => Promise<void>
): Promise<void> {
  const consumer = getKafkaConsumer();

  if (!consumer) {
    logger.error(
      '[Kafka Consumer] ❌ Consumer not initialized. Did you call connectKafkaClients()?'
    );
    throw new Error('Kafka consumer not connected.');
  }

  try {
    for (const topic of config.topics) {
      await consumer.subscribe({ topic, fromBeginning: false });
      logger.info(`[Kafka Consumer] 📥 Subscribed to topic: "${topic}"`);
    }

    await consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        const { topic, partition, message } = payload;
        const value = message?.value?.toString() ?? '';

        logger.info(
          `[Kafka Consumer] 🔄 Message on topic "${topic}" (partition: ${partition})`
        );
        logger.debug(`[Kafka Consumer] 📨 Payload: ${value}`);

        try {
          if (onMessage) {
            await onMessage(value);
          } else if (config.handleMessage) {
            await config.handleMessage(topic, payload);
          } else {
            logger.warn(`[Kafka Consumer] ⚠️ No message handler provided`);
          }
        } catch (err) {
          logger.error(`[Kafka Consumer] ❌ Error processing message:`, err);
        }
      },
    });
  } catch (error) {
    logger.error('[Kafka Consumer] ❌ Failed to run consumer:', error);
    throw error;
  }
}

/**
 * Disconnects the Kafka consumer safely.
 */
export async function disconnectKafkaConsumer(): Promise<void> {
  const consumer = getKafkaConsumer();

  if (!consumer) {
    logger.warn('[Kafka Consumer] ⚠️ No active consumer to disconnect.');
    return;
  }

  try {
    await consumer.disconnect();
    logger.info('[Kafka Consumer] 🔌 Disconnected from Kafka.');
  } catch (error) {
    logger.error('[Kafka Consumer] ❌ Error while disconnecting:', error);
  }
}
