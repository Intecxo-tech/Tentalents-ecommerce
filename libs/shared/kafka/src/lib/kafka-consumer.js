"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectKafkaConsumer = connectKafkaConsumer;
exports.disconnectKafkaConsumer = disconnectKafkaConsumer;
const kafka_client_1 = require("./kafka-client"); // ✅ Corrected import
const logger_1 = require("@shared/logger"); // Replace with console if needed
/**
 * Starts Kafka consumer with topic subscriptions and message handler.
 */
async function connectKafkaConsumer(config, onMessage) {
    const consumer = (0, kafka_client_1.getKafkaConsumer)();
    if (!consumer) {
        logger_1.logger.error('[Kafka Consumer] ❌ Consumer not initialized. Did you call connectKafkaClients()?');
        throw new Error('Kafka consumer not connected.');
    }
    try {
        for (const topic of config.topics) {
            await consumer.subscribe({ topic, fromBeginning: false });
            logger_1.logger.info(`[Kafka Consumer] 📥 Subscribed to topic: "${topic}"`);
        }
        await consumer.run({
            eachMessage: async (payload) => {
                const { topic, partition, message } = payload;
                const value = message?.value?.toString() ?? '';
                logger_1.logger.info(`[Kafka Consumer] 🔄 Message on topic "${topic}" (partition: ${partition})`);
                logger_1.logger.debug(`[Kafka Consumer] 📨 Payload: ${value}`);
                try {
                    if (onMessage) {
                        await onMessage(value);
                    }
                    else if (config.handleMessage) {
                        await config.handleMessage(topic, payload);
                    }
                    else {
                        logger_1.logger.warn(`[Kafka Consumer] ⚠️ No message handler provided`);
                    }
                }
                catch (err) {
                    logger_1.logger.error(`[Kafka Consumer] ❌ Error processing message:`, err);
                }
            },
        });
    }
    catch (error) {
        logger_1.logger.error('[Kafka Consumer] ❌ Failed to run consumer:', error);
        throw error;
    }
}
/**
 * Disconnects the Kafka consumer safely.
 */
async function disconnectKafkaConsumer() {
    const consumer = (0, kafka_client_1.getKafkaConsumer)();
    if (!consumer) {
        logger_1.logger.warn('[Kafka Consumer] ⚠️ No active consumer to disconnect.');
        return;
    }
    try {
        await consumer.disconnect();
        logger_1.logger.info('[Kafka Consumer] 🔌 Disconnected from Kafka.');
    }
    catch (error) {
        logger_1.logger.error('[Kafka Consumer] ❌ Error while disconnecting:', error);
    }
}
//# sourceMappingURL=kafka-consumer.js.map