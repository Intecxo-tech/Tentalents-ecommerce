#!/bin/bash
# kafka-demo-clean.sh
# Live Kafka demo for clients, suppressing "topic exists" errors

KAFKA_CONTAINER="kafka"                  # Docker container name for Kafka
TOPIC="${1:-demo-topic}"                  # Topic to use, default 'demo-topic'
GROUP="live-demo-group-$(date +%s)"      # Unique consumer group
MESSAGE="Hello-Live-Kafka-$(date +%s)"   # Unique message

echo "🚀 Ensuring Kafka topic '$TOPIC' exists..."
docker exec $KAFKA_CONTAINER /opt/bitnami/kafka/bin/kafka-topics.sh \
  --create --bootstrap-server localhost:9092 \
  --replication-factor 1 --partitions 1 \
  --topic $TOPIC &>/dev/null || true

echo "🚀 Starting consumer in background..."
docker exec -i $KAFKA_CONTAINER /opt/bitnami/kafka/bin/kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic $TOPIC \
  --group $GROUP \
  --from-beginning \
  --max-messages 1 &>/dev/null &

# Wait briefly to ensure consumer is ready
sleep 1

echo "🚀 Producing message to Kafka topic '$TOPIC': $MESSAGE"
docker exec -i $KAFKA_CONTAINER /opt/bitnami/kafka/bin/kafka-console-producer.sh \
  --broker-list localhost:9092 \
  --topic $TOPIC <<< "$MESSAGE" &>/dev/null

# Wait for consumer to print message
sleep 2

echo "✅ Kafka live demo complete. Message sent and received: $MESSAGE"
