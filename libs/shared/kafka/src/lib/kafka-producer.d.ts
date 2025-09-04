import { Producer, ProducerRecord } from 'kafkajs';
/**
 * Ensures Kafka producer is connected (singleton).
 */
export declare function connectKafkaProducer(): Promise<Producer>;
/**
 * Sends a Kafka event using a ProducerRecord.
 */
export declare function produceKafkaEvent(record: ProducerRecord): Promise<void>;
/**
 * Gracefully disconnects the Kafka producer.
 */
export declare function disconnectKafkaProducer(): Promise<void>;
//# sourceMappingURL=kafka-producer.d.ts.map