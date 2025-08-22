#!/bin/bash

# Root directory where services live
ROOT_DIR="apps/backend"

# List of services
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

# Content of .dockerignore
dockerignore_content="node_modules
dist
.git
*.log
.env"

# Create .dockerignore for each service
for service in "${services[@]}"; do
  SERVICE_DIR="$ROOT_DIR/$service"
  mkdir -p "$SERVICE_DIR"

  echo "$dockerignore_content" > "$SERVICE_DIR/.dockerignore"
  echo "Created .dockerignore for $service"
done

echo "All .dockerignore files created successfully!"
