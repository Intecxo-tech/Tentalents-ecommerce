import { EachMessagePayload } from 'kafkajs';
export interface KafkaConsumerConfig {
    groupId: string;
    topics: string[];
    handleMessage?: (topic: string, payload: EachMessagePayload) => Promise<void>;
}
/**
 * Starts Kafka consumer with topic subscriptions and message handler.
 */
export declare function connectKafkaConsumer(config: KafkaConsumerConfig, onMessage?: (message: string) => Promise<void>): Promise<void>;
/**
 * Disconnects the Kafka consumer safely.
 */
export declare function disconnectKafkaConsumer(): Promise<void>;
//# sourceMappingURL=kafka-consumer.d.ts.map