import { Producer, ProducerRecord } from 'kafkajs';
import { Kafka } from 'kafkajs';
import { logger } from '@shared/logger';
import { getKafkaInstance } from './kafka-client'; // 🔧 Use this utility instead of importing kafka directly

let producer: Producer | null = null;

/**
 * Ensures Kafka producer is connected (singleton).
 */
export async function connectKafkaProducer(): Promise<Producer> {
  if (producer) {
    logger.debug('[Kafka Producer] 🟢 Already connected');
    return producer;
  }
const kafka: Kafka = getKafkaInstance();
  // const kafka: Kafka | null = getKafkaInstance(); 
  if (!kafka) {
    throw new Error('[Kafka Producer] ❌ Kafka is not initialized');
  }

  producer = kafka.producer();

  try {
    await producer.connect();
    logger.info('[Kafka Producer] ✅ Connected');
    return producer;
  } catch (error) {
    logger.error('[Kafka Producer] ❌ Connection failed:', error);
    producer = null;
    throw error;
  }
}

/**
 * Sends a Kafka event using a ProducerRecord.
 */
export async function produceKafkaEvent(record: ProducerRecord): Promise<void> {
  try {
    const activeProducer = await connectKafkaProducer();
    await activeProducer.send(record);

    logger.info(`[Kafka Producer] 📤 Sent message to topic "${record.topic}"`);
    logger.debug(`[Kafka Producer] 🔍 Payload: ${JSON.stringify(record)}`);
  } catch (error) {
    logger.error('[Kafka Producer] ❌ Failed to send message:', error);
    throw error;
  }
}

/**
 * Gracefully disconnects the Kafka producer.
 */
export async function disconnectKafkaProducer(): Promise<void> {
  if (!producer) {
    logger.warn('[Kafka Producer] ⚠️ No active producer to disconnect.');
    return;
  }

  try {
    await producer.disconnect();
    logger.info('[Kafka Producer] 🔌 Disconnected');
  } catch (error) {
    logger.error('[Kafka Producer] ❌ Disconnection failed:', error);
  } finally {
    producer = null;
  }
}
