#!/bin/bash
# 🟢 Kafka Live Demo Script

TOPIC="demo-topic"
BROKER="localhost:9092"
MSG="Hello-Live-Kafka-$(date +%s)"

echo "🚀 Ensuring Kafka topic '$TOPIC' exists..."
/opt/bitnami/kafka/bin/kafka-topics.sh --create \
  --bootstrap-server $BROKER \
  --replication-factor 1 \
  --partitions 1 \
  --topic $TOPIC 2>/dev/null || echo "Topic '$TOPIC' already exists."

echo "🚀 Starting consumer in background..."
/opt/bitnami/kafka/bin/kafka-console-consumer.sh \
  --bootstrap-server $BROKER \
  --topic $TOPIC \
  --from-beginning \
  --timeout-ms 5000 | while read line; do
    echo "📩 Message received: $line"
done &

sleep 1 # give consumer time to start

echo "🚀 Producing message to Kafka topic '$TOPIC': $MSG"
/opt/bitnami/kafka/bin/kafka-console-producer.sh \
  --broker-list $BROKER \
  --topic $TOPIC <<< "$MSG"

sleep 2 # give consumer time to display message

echo "✅ Kafka live demo complete."
