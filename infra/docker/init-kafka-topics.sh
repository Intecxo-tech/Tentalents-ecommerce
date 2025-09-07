#!/bin/bash
set -e  # exit immediately on any error

KAFKA_BIN="/opt/bitnami/kafka/bin/kafka-topics.sh"
BROKER="kafka:9092"
WORKSPACE="/workspace"

echo "🌀 Creating Kafka topics..."

# Extract topic names from libs/shared/kafka/src/lib/kafka-topics.ts
TOPICS=$(grep -oP '"[a-zA-Z0-9._-]+"' $WORKSPACE/../libs/shared/kafka/src/lib/kafka-topics.ts | tr -d '"')

if [ -z "$TOPICS" ]; then
  echo "❌ No topics found in kafka-topics.ts"
  exit 1
fi

for TOPIC in $TOPICS; do
  echo "🛠 Creating topic: $TOPIC"
  $KAFKA_BIN --bootstrap-server $BROKER --create \
    --topic "$TOPIC" --partitions 3 --replication-factor 1 --if-not-exists || true
done

echo "✅ All topics created!"
