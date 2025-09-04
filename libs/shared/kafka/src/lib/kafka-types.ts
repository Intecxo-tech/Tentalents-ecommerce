import { EachMessagePayload, ProducerRecord } from 'kafkajs';

/**
 * Common interface for publishing Kafka events.
 */
export interface KafkaEvent {
  topic: string;
  key?: string;
  value: string | Buffer | Record<string, any>; // JSON or stringified
  headers?: Record<string, string | Buffer>;
  partition?: number;
}

/**
 * Kafka producer wrapper input, compatible with kafkajs.
 */
export type KafkaProducerMessage = ProducerRecord;

/**
 * Configuration passed when initializing a Kafka consumer.
 */
export interface KafkaConsumerConfig {
  groupId: string;
  topics: string[];
  handleMessage?: (topic: string, payload: EachMessagePayload) => Promise<void>;
}

/**
 * Generic handler function signature for consuming Kafka messages.
 */
export type KafkaMessageHandler = (
  message: EachMessagePayload
) => Promise<void>;

/**
 * Optional standardized Kafka headers (can be extended as needed).
 */
export type KafkaHeaders = Record<string, string | Buffer>;
