#!/bin/bash

# Root directory where backend services live
ROOT_DIR="apps/backend"

# List of backend services
services=(
  "user-service"
  "product-service"
  "order-service"
  "rating-service"
  "email-service"
  "payment-service"
  "search-service"
  "cart-service"
  "admin-service"
  "invoice-service"
  "analytics-service"
  "vendor-service"
)

echo "Starting npm install for all backend services..."

for service in "${services[@]}"; do
  SERVICE_DIR="$ROOT_DIR/$service"

  if [ -d "$SERVICE_DIR" ]; then
    echo "Installing dependencies for $service..."
    cd "$SERVICE_DIR" || exit
    npm install
    cd - >/dev/null
  else
    echo "Directory $SERVICE_DIR does not exist, skipping..."
  fi
done

echo "npm install completed for all backend services!"
