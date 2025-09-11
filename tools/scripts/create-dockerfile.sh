#!/bin/bash
set -e

# Directory containing backend services
APPS_DIR="apps/backend"

# Detect all services dynamically
services=()
for SERVICE_PATH in "$APPS_DIR"/*; do
  if [ -d "$SERVICE_PATH" ]; then
    services+=("$(basename "$SERVICE_PATH")")
  fi
done

# Function to create Dockerfile for a service
generate_dockerfile() {
  local service=$1
  local service_dir="$APPS_DIR/$service"
  local dockerfile_path="$service_dir/Dockerfile"

  cat > "$dockerfile_path" <<EOL
# ---------------- Builder Stage ----------------
FROM node:20.10.0 AS builder
WORKDIR /app

# Copy package manifests and Nx config
COPY package*.json tsconfig.base.json nx.json ./

# Install all dependencies (including dev for Nx build)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY apps/ ./apps/
COPY libs/ ./libs/

# Disable Nx daemon & ESLint globally
ENV NX_DAEMON=false
ENV NX_NO_ESLINT_PLUGIN=true

# Build this service
ARG SERVICE_NAME=$service
RUN npx nx build apps/backend/\$SERVICE_NAME --configuration=production --skip-nx-cache --no-eslint

# ---------------- Runtime Stage ----------------
FROM node:20.10.0 AS runtime
WORKDIR /app

ARG SERVICE_NAME=$service
COPY --from=builder /app/dist/apps/backend/\$SERVICE_NAME ./dist
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev --legacy-peer-deps

CMD ["node", "dist/main.js"]
EOL

  echo "✅ Dockerfile created for $service at $dockerfile_path"
}

# Generate Dockerfiles for all services
for service in "${services[@]}"; do
  generate_dockerfile "$service"
done

echo "🎉 Dockerfiles generated for all services. You can now build images in CI/CD."
