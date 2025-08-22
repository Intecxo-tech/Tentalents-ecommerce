# 🧵 How Kafka Powers Your Event-Driven Nx Monorepo E-Commerce Platform

## 🧠 1. What is Kafka?

Apache Kafka is a distributed event streaming platform that enables seamless communication between microservices by sending, receiving, and storing messages (events) in real-time.

Kafka allows your services to:

- 📤 **Produce events** (e.g., a user signs up)
- 📥 **Consume events** (e.g., send a welcome email)
- 💾 **Persist events** reliably and durably

---

## 🍕 Imagine Your Platform as a Pizza Delivery Company

Your platform is like a Pizza Delivery Company with multiple departments (microservices).  
Kafka is the **Dispatch Center 📞** — departments don’t talk directly. They send/receive updates through the Dispatch (Kafka).

| Microservice        | Department Role       | Kafka Role                     |
|--------------------|--------------------|--------------------------------|
| user-service        | New Customer Desk   | Sends `user.created`           |
| product-service     | Menu Management     | Sends `product.updated`        |
| cart-service        | Cart Desk           | Sends cart events              |
| order-service       | Order Counter       | Sends/receives orders          |
| payment-service     | Payment Terminal    | Sends/receives payments        |
| email-service       | Email Bot           | Listens to all events          |
| search-service      | Product Billboard   | Receives product updates       |
| rating-service      | Suggestion Box      | Optional consumer              |
| vendor-service      | Vendor Management   | Sends/receives vendor events   |
| invoice-service     | Billing Desk        | Sends/receives invoice events  |
| admin-service       | Admin Console       | Optional consumer / audit logs |
| analytics-service   | Analytics Dashboard | Consumes all events for insights |

---

## 🍕 Kafka in Action: A Customer Orders Pizza

1. **Customer Signs Up**
   - `user-service` emits `user.created`
   - Kafka stores it in the `user.created` topic
   - `email-service` receives it → sends welcome email
   - `analytics-service` receives it → logs event

2. **Menu Gets Updated**
   - `product-service` emits `product.updated`
   - Kafka stores it
   - `search-service` receives it → updates search index
   - `analytics-service` logs it

3. **Cart Checkout**
   - `cart-service` emits `cart.updated` & `cart.checkedout`
   - `analytics-service` logs it

4. **Order is Placed**
   - `order-service` receives `cart.checkedout` → emits `order.created`
   - Kafka notifies:
     - `email-service` → sends confirmation
     - `payment-service` → starts payment process
     - `analytics-service` → logs it

5. **Payment Success**
   - `payment-service` emits `payment.success`
   - Kafka routes it to:
     - `order-service` → marks order as paid
     - `email-service` → sends receipt
     - `invoice-service` → generates invoice
     - `analytics-service` → logs it

6. **Vendor Updates**
   - `vendor-service` emits `vendor.status.updated`
   - Kafka routes it to `analytics-service` and `admin-service` for monitoring

---

## 🧩 Kafka Internals: Key Concepts

| Term           | Meaning                                        |
|----------------|-----------------------------------------------|
| Topic          | A message category (e.g., `user.created`)    |
| Producer       | Sends messages to a topic                     |
| Consumer       | Reads messages from a topic                   |
| Partition      | Topic slice to support parallel processing   |
| Offset         | Index of a message in a partition            |
| Consumer Group | Set of consumers sharing the load            |
| Broker         | Kafka server in the cluster                   |

---

## 🧰 Kafka Code Setup – Shared Library: `@shared/kafka`

**🔗 kafka.config.ts**
```ts
import { Kafka } from 'kafkajs';

export const kafka = new Kafka({
  clientId: 'ecommerce-platform',
  brokers: ['kafka:9092'],
});
📘 kafka.topics.ts

ts


export const KafkaTopics = {
  USER_CREATED: 'user.created',
  PRODUCT_UPDATED: 'product.updated',
  ORDER_CREATED: 'order.created',
  PAYMENT_SUCCESS: 'payment.success',
  CART_UPDATED: 'cart.updated',
  CART_CHECKEDOUT: 'cart.checkedout',
  VENDOR_STATUS_UPDATED: 'vendor.status.updated',
  INVOICE_CREATED: 'invoice.created',
};
📤 kafka.producer.ts

ts


const producer = kafka.producer();

export const connectProducer = async () => await producer.connect();

export const sendMessage = async (topic: string, payload: object) => {
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(payload) }],
  });
};
📥 kafka.consumer.ts

ts


export const createConsumer = async (
  groupId: string,
  topic: string,
  handler: (data: any) => Promise<void>
) => {
  const consumer = kafka.consumer({ groupId });
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (message?.value) {
        const parsed = JSON.parse(message.value.toString());
        await handler(parsed);
      }
    },
  });

  return consumer;
};
🎯 Kafka Roles Per Microservice
Microservice	Role	Kafka Events Involved
user-service	🟢 Producer	user.created
product-service	🟢 Producer	product.updated
cart-service	🟢 Producer	cart.updated, cart.checkedout
order-service	🟢 Producer / 🔵 Consumer	order.created (produced), cart.checkedout, payment.success (consumed)
payment-service	🟢 Producer / 🔵 Consumer	payment.success (produced), order.created (consumed)
email-service	🔵 Consumer	user.created, order.created, payment.success
search-service	🔵 Consumer	product.updated
rating-service	⚪ Optional Consumer	Optional future use
vendor-service	🟢 Producer / 🔵 Consumer	vendor.status.updated
invoice-service	🟢 Producer / 🔵 Consumer	invoice.created
admin-service	🔵 Consumer	Audit, monitoring
analytics-service	🔵 Consumer	All relevant events for insights

