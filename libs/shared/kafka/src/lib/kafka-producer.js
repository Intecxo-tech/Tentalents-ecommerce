"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectKafkaProducer = connectKafkaProducer;
exports.produceKafkaEvent = produceKafkaEvent;
exports.disconnectKafkaProducer = disconnectKafkaProducer;
const logger_1 = require("@shared/logger");
const kafka_client_1 = require("./kafka-client"); // 🔧 Use this utility instead of importing kafka directly
let producer = null;
/**
 * Ensures Kafka producer is connected (singleton).
 */
async function connectKafkaProducer() {
    if (producer) {
        logger_1.logger.debug('[Kafka Producer] 🟢 Already connected');
        return producer;
    }
    const kafka = (0, kafka_client_1.getKafkaInstance)(); // ✅ Safely retrieve instance
    if (!kafka) {
        throw new Error('[Kafka Producer] ❌ Kafka is not initialized');
    }
    producer = kafka.producer();
    try {
        await producer.connect();
        logger_1.logger.info('[Kafka Producer] ✅ Connected');
        return producer;
    }
    catch (error) {
        logger_1.logger.error('[Kafka Producer] ❌ Connection failed:', error);
        producer = null;
        throw error;
    }
}
/**
 * Sends a Kafka event using a ProducerRecord.
 */
async function produceKafkaEvent(record) {
    try {
        const activeProducer = await connectKafkaProducer();
        await activeProducer.send(record);
        logger_1.logger.info(`[Kafka Producer] 📤 Sent message to topic "${record.topic}"`);
        logger_1.logger.debug(`[Kafka Producer] 🔍 Payload: ${JSON.stringify(record)}`);
    }
    catch (error) {
        logger_1.logger.error('[Kafka Producer] ❌ Failed to send message:', error);
        throw error;
    }
}
/**
 * Gracefully disconnects the Kafka producer.
 */
async function disconnectKafkaProducer() {
    if (!producer) {
        logger_1.logger.warn('[Kafka Producer] ⚠️ No active producer to disconnect.');
        return;
    }
    try {
        await producer.disconnect();
        logger_1.logger.info('[Kafka Producer] 🔌 Disconnected');
    }
    catch (error) {
        logger_1.logger.error('[Kafka Producer] ❌ Disconnection failed:', error);
    }
    finally {
        producer = null;
    }
}
//# sourceMappingURL=kafka-producer.js.map