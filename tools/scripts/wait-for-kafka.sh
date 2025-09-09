#!/bin/bash
# wait-for-kafka.sh
# Wait for Kafka to be ready, then create topics

set -e

# Kafka host and port (can be overridden with environment variables)
KAFKA_HOST=${KAFKA_HOST:-kafka}   # service name in docker-compose
KAFKA_PORT=${KAFKA_PORT:-9092}

echo "⏳ Waiting for Kafka at $KAFKA_HOST:$KAFKA_PORT..."

# Wait until Kafka is accepting connections
while ! nc -z "$KAFKA_HOST" "$KAFKA_PORT"; do
  sleep 1
done

echo "✅ Kafka is up! Creating topics..."

# Determine if we are inside the kafka-init container
if [ -f /tools/scripts/create-kafka-topics.sh ]; then
    # Running inside container: call script directly
    /bin/bash /tools/scripts/create-kafka-topics.sh
else
    # Running from host: set BROKER to localhost and use docker exec
    export BROKER=localhost:9092
    /bin/bash ./tools/scripts/create-kafka-topics.sh
fi

echo "🎉 Topics created!"
