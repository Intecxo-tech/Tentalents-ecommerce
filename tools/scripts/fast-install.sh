#!/bin/bash
set -e

echo "⚡ Starting fast WSL setup..."

# 1️⃣ Ensure pnpm is installed
command -v pnpm >/dev/null 2>&1 || sudo npm install -g pnpm

# 2️⃣ Configure pnpm (store reuse + retries)
pnpm config set store-dir ~/.pnpm-store
pnpm config set fetch-retries 5
pnpm config set fetch-retry-factor 2
pnpm config set fetch-retry-mintimeout 1000
pnpm config set fetch-retry-maxtimeout 60000
pnpm config set prefer-offline true
pnpm config set auto-install-peers true

# 3️⃣ Install dependencies (reuse store, update lockfile if needed)
pnpm install --no-frozen-lockfile --prefer-offline

# 4️⃣ Start infrastructure (Redis, Kafka, Postgres, MinIO)
docker compose up -d redis kafka postgres minio
sleep 15  # wait for services

# 5️⃣ Build and start all backend services dynamically
for dir in apps/backend/*; do
  if [ -d "$dir" ] && [ -f "$dir/Dockerfile" ]; then
    echo "📦 Building and starting $(basename "$dir")..."
    docker compose up -d --build $(basename "$dir")
  fi
done

echo "🎉 Setup complete! Dependencies installed and services running."
