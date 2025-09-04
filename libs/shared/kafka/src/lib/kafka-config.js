"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kafkaConfig = void 0;
// libs/shared/kafka/src/lib/kafka-config.ts
const kafkajs_1 = require("kafkajs");
exports.kafkaConfig = {
    clientId: 'hktvmall-style-backend',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    logLevel: kafkajs_1.logLevel.INFO,
    // Uncomment only if your KRaft cluster requires auth
    /*
    ssl: true,
    sasl: {
      mechanism: 'plain', // Or 'scram-sha-256' or 'scram-sha-512'
      username: process.env.KAFKA_USERNAME || '',
      password: process.env.KAFKA_PASSWORD || '',
    },
    */
};
// KAFKA_CLIENT_ID=my-kraft-app
// KAFKA_BROKERS=localhost:9092
// KAFKA_USE_AUTH=true
// KAFKA_SASL_MECHANISM=plain
// KAFKA_USERNAME=myuser
// KAFKA_PASSWORD=mypassword
//# sourceMappingURL=kafka-config.js.map