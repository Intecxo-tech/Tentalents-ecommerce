// import { KafkaConfig, logLevel } from 'kafkajs';

// export const kafkaConfig: KafkaConfig & { groupId: string } = {
//   clientId: process.env.KAFKA_CLIENT_ID || 'backend-client',
//   brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
//   logLevel: logLevel.INFO,
//   groupId: process.env.KAFKA_GROUP_ID || 'backend-consumer-group',

// };
import { KafkaConfig, logLevel } from 'kafkajs';

export const kafkaConfig: KafkaConfig & { groupId: string, ssl: boolean, sasl: { mechanism: string, username: string, password: string } } = {
  clientId: process.env.KAFKA_CLIENT_ID || 'backend-client',
  brokers: (process.env.KAFKA_BROKERS || 'd2g2jt1modb6qsnje0rg.any.ap-south-1.mpx.prd.cloud.redpanda.com:9093').split(','),
  logLevel: logLevel.INFO,
  groupId: process.env.KAFKA_GROUP_ID || 'backend-consumer-group',

  ssl: true,
  sasl: {
    mechanism: 'scram-sha-256', // or 'scram-sha-512' based on your Redpanda credentials
    username: process.env.KAFKA_USERNAME || 'Karishma', // replace with your Redpanda username or env var
    password: process.env.KAFKA_PASSWORD || 'FmeFCWOtN139wzfesfss9ELtw4iWTg', // replace with your Redpanda password or env var
  },
};
