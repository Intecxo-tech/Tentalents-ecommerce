import { Kafka, KafkaConfig, Consumer } from 'kafkajs';
import { kafkaConfig } from './kafka-config';
import { logger } from '@shared/logger';

let kafka: Kafka | null = null;
let consumer: Consumer | null = null;

/**
 * Automatically initializes Kafka instance if not already created.
 */
export const getKafkaInstance = (): Kafka => {
  if (!kafka) {
    logger.info('[Kafka] 🔧 Initializing Kafka instance...');
    kafka = new Kafka(kafkaConfig);
  }
  return kafka;
};

/**
 * Automatically creates & returns Kafka consumer if not already created.
 */
export const getKafkaConsumer = (): Consumer => {
  if (!consumer) {
    logger.info('[Kafka] 🔧 Creating Kafka consumer...');
    const kafka = getKafkaInstance();
consumer = kafka.consumer({ groupId: kafkaConfig.groupId || 'default-consumer-group' });

  }
  return consumer;
};

/**
 * Optional: Manually set a consumer instance (still supported).
 */
export const setKafkaConsumer = (instance: Consumer) => {
  consumer = instance;
};
