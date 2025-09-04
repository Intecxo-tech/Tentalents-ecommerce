"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKafkaInstance = exports.initKafka = void 0;
const kafkajs_1 = require("kafkajs");
let kafka = null;
const initKafka = (config) => {
    kafka = new kafkajs_1.Kafka(config);
};
exports.initKafka = initKafka;
const getKafkaInstance = () => {
    if (!kafka) {
        throw new Error('Kafka is not initialized. Call initKafka() first.');
    }
    return kafka;
};
exports.getKafkaInstance = getKafkaInstance;
//# sourceMappingURL=kafka-client.js.map