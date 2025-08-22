#!/bin/bash
set -euo pipefail

# -------------------------------
# Paths & Config
# -------------------------------
NAMES_FILE="libs/shared/constants/src/lib/service-names.ts"
PORTS_FILE="libs/shared/constants/src/lib/service-ports.ts"
BASE_DIR="apps/backend"
NODE_VERSION="${NODE_VERSION:-20}"  # Default Node version
DIST_BASE="dist/apps/backend"

declare -A NAME_MAP

# -------------------------------
# Parse SERVICE_NAMES enum
# -------------------------------
names_lines=$(sed -n '/export enum SERVICE_NAMES {/,/}/p' "$NAMES_FILE" | grep -E "^[[:space:]]*[A-Z_]+\s*=")
while IFS= read -r line; do
  enum_key=$(echo "$line" | sed -E "s/^\s*([A-Z_]+)\s*=.*$/\1/")
  service_name=$(echo "$line" | sed -E "s/^\s*[A-Z_]+\s*=\s*'([^']+)'.*$/\1/")
  NAME_MAP["$enum_key"]="$service_name"
done <<< "$names_lines"

# -------------------------------
# Parse SERVICE_PORTS mapping
# -------------------------------
ports_lines=$(sed -n '/SERVICE_PORTS/,/};/p' "$PORTS_FILE" | grep -E "\[SERVICE_NAMES\.[A-Z_]+\]")

while IFS= read -r line; do
  enum_key=$(echo "$line" | sed -E "s/.*\[SERVICE_NAMES\.([A-Z_]+)\].*/\1/")
  port=$(echo "$line" | sed -E "s/.*:\s*([0-9]+),?.*/\1/")

  service="${NAME_MAP[$enum_key]:-}"

  if [ -z "$service" ]; then
    echo "⚠️  Warning: No service name found for enum key '$enum_key', skipping."
    continue
  fi

  service_dir="$BASE_DIR/$service"
  dockerfile_path="$service_dir/Dockerfile"
  dist_dir="$DIST_BASE/$service"

  # Skip services with no dist folder
  if [ ! -d "$dist_dir" ]; then
    echo "⚠️  Skipping $service: dist folder '$dist_dir' not found. Build the service first."
    continue
  fi

  # Ensure service directory exists
  mkdir -p "$service_dir"

  echo "📦 Generating Dockerfile for $service on port $port..."

  cat > "$dockerfile_path" <<EOF
# ================================================================
# Dockerfile for $service
#
# Build Command:
#     npx nx build $service
#
# Usage:
#     docker build -f apps/backend/$service/Dockerfile -t $service .
#     docker run -p $port:$port --env-file .env $service
# ================================================================

FROM node:${NODE_VERSION}-alpine

WORKDIR /app

# Copy only this service's package.json
COPY apps/backend/$service/package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy pre-built service dist
COPY $dist_dir ./dist

# Expose service port
EXPOSE $port

# Start service
CMD ["node", "dist/main.js"]
EOF

done <<< "$ports_lines"

echo "✅ All Dockerfiles generated successfully!"
