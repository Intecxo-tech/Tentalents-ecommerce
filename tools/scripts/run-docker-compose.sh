#!/bin/bash
# =================================================
# 🚀 All-in-One Script: Build deps + Start services + Tail logs
# =================================================

# Step 1: Build Docker image with cached dependencies
echo "🛠️  Building Docker base image with cached dependencies..."
docker build -f Dockerfile.deps -t tentalents-deps .

# Step 2: Start all services + infrastructure
echo "🚀 Starting all containers..."
docker compose --env-file .env up -d

# Step 3: Wait for a few seconds for infrastructure to initialize
echo "⏳ Waiting 10 seconds for Postgres, Redis, Kafka, MinIO..."
sleep 10

# Step 4: Tail logs of all services
echo "📄 Tailing logs of all services. Press Ctrl+C to stop."
docker compose --env-file .env logs -f






# 1️⃣ Build Docker image with cached dependencies
docker build -f Dockerfile.deps -t tentalents-deps .

# 2️⃣ Start all services + infrastructure (detached)
docker compose --env-file .env up -d

# 3️⃣ Wait a few seconds for Postgres, Redis, Kafka, MinIO to initialize
sleep 10

# 4️⃣ Tail logs of all services
docker compose --env-file .env logs -f

# 5️⃣ Stop all services
# docker compose down

# 6️⃣ Stop all services + remove volumes
# docker compose down -v

# 7️⃣ Rebuild and restart all services
# docker compose --env-file .env up -d --build

# 8️⃣ Start a single service
# docker compose --env-file .env up -d user-service

# 9️⃣ Rebuild and restart a single service
# docker compose --env-file .env up -d --build user-service

# 🔟 Tail logs of a single service
# docker compose --env-file .env logs -f user-service
