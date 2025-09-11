#!/bin/bash
set -e

# Prefix for Docker images
IMAGE_PREFIX="tentalents"

# Directory containing backend services
APPS_DIR="apps/backend"

# Detect all services dynamically
services=()
for SERVICE_PATH in "$APPS_DIR"/*; do
  if [ -d "$SERVICE_PATH" ]; then
    services+=("$(basename "$SERVICE_PATH")")
  fi
done

echo "🚀 Building Docker images for all services in parallel..."

# Build function
build_service() {
  local service=$1
  echo "🔧 Building Docker image for $service..."
  
  docker build \
    -t ${IMAGE_PREFIX}/$service \
    $APPS_DIR/$service

  echo "✅ Built $service"
}

# Export function and variables for parallel execution
export -f build_service
export IMAGE_PREFIX
export APPS_DIR

# Run builds in parallel (4 at a time, adjust -P for concurrency)
printf "%s\n" "${services[@]}" | xargs -n1 -P4 -I{} bash -c 'build_service "$@"' _ {}

echo "🎉 All Docker images built successfully."
