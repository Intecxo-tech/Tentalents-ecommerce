#!/bin/bash

KAFKA_CONTAINER="kafka"
TOPIC="${1:-test-topic}"
UNIQUE_MSG="health-check-$(date +%s)"
GROUP="health-check-group-$(date +%s)"

# Step 1: Produce a unique message
docker exec -i $KAFKA_CONTAINER /opt/bitnami/kafka/bin/kafka-console-producer.sh \
  --broker-list localhost:9092 --topic $TOPIC <<< "$UNIQUE_MSG"

# Step 2: Give Kafka a moment to persist the message
sleep 2

# Step 3: Consume messages with a fresh group (stderr suppressed)
RESULT=$(docker exec $KAFKA_CONTAINER /opt/bitnami/kafka/bin/kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic $TOPIC \
  --group $GROUP \
  --from-beginning \
  --max-messages 20 \
  --timeout-ms 5000 2>/dev/null)

# Step 4: Verify the unique message
if echo "$RESULT" | grep -q "$UNIQUE_MSG"; then
  echo "✅ Kafka is healthy. Latest message: $UNIQUE_MSG"
else
  echo "❌ Kafka health check failed. Last messages read: $RESULT"
fi
