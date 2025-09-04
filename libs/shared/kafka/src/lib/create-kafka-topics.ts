// create-kafka-topics.ts

import { Kafka } from 'kafkajs';

// ✅ Configuration for Redpanda
const kafka = new Kafka({
  clientId: 'backend-client',
  brokers: ['d2g2jt1modb6qsnje0rg.any.ap-south-1.mpx.prd.cloud.redpanda.com:9092'],
  ssl: true,
  sasl: {
    mechanism: 'scram-sha-256',
    username: 'Karishma',
    password: 'kWctuLCYqJcK0FQ037FehBoWVdOJa8',
  },
});

// ✅ Topics to create
const ALL_KAFKA_TOPICS = [
  'user.created',
  'user.updated',
  'user.deleted',
  'user.registered',
  'user.registration.otp',
  'user.vendor.registered',
  'order.created',
  'order.status.updated',
  'order.cancelled',
  'payment.initiated',
  'payment.success',
  'payment.failed',
  'product.created',
  'product.updated',
  'product.deleted',
  'product.rated',
  'email.user.created',
  'email.order.created',
  'email.payment.success',
  'invoice.generate',
  'invoice.generated',
  'invoice.failed',
  'notification.sent',
  'cart.updated',
  'cart.checkedout',
  'analytics.user.behavior',
  'search.sync.product',
  'vendor.created',
  'vendor.status.updated',
];

async function createTopics() {
  const admin = kafka.admin();
  await admin.connect();

  const existingTopics = await admin.listTopics();

  const topicsToCreate = ALL_KAFKA_TOPICS.filter((topic) => !existingTopics.includes(topic));

  if (topicsToCreate.length === 0) {
    console.log('✅ All Kafka topics already exist.');
  } else {
    await admin.createTopics({
      topics: topicsToCreate.map((topic) => ({
        topic,
        numPartitions: 1,
        replicationFactor: 1,
      })),
    });
    console.log(`🎉 Created topics: ${topicsToCreate.join(', ')}`);
  }

  await admin.disconnect();
}

// ✅ Run script
createTopics()
  .then(() => {
    console.log('🚀 Topic creation complete.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error creating Kafka topics:', error);
    process.exit(1);
  });
