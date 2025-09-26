#!/bin/bash
# ---------------------------
# Script: build-docker-images.sh
# Purpose: Build Docker images for all microservices using existing Dockerfiles
# ---------------------------

BASE_DIR="apps/backend"

SERVICES=(
  "analytics-service"
  "admin-service"
  "vendor-service"
  "invoice-service"
  "user-service"
  "product-service"
  "order-service"
  "rating-service"
  "email-service"
  "payment-service"
  "search-service"
  "cart-service"
)

for service in "${SERVICES[@]}"; do
  DIR="$BASE_DIR/$service"

  if [ ! -d "$DIR" ]; then
    echo "Skipping $service (directory not found)"
    continue
  fi

  if [ ! -f "$DIR/Dockerfile" ]; then
    echo "Skipping $service (Dockerfile not found)"
    continue
  fi

  echo "Building Docker image for $service..."
  docker build -t "$service:latest" "$DIR"

  echo "Docker image for $service built successfully!"
done
