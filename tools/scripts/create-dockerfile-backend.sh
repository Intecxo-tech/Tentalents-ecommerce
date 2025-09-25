#!/bin/bash
# Script to generate per-backend-service Dockerfiles using base-builder
# Usage: ./tools/scripts/create-dockerfile-backend.sh

set -e

# Correct paths to shared constants
SERVICE_NAMES_FILE="libs/shared/constants/src/lib/service-names.ts"
SERVICE_PORTS_FILE="libs/shared/constants/src/lib/service-ports.ts"

BASE_DIR="$(pwd)"

# Read all backend services from shared constants
BACKEND_SERVICES=(
$(grep -oP "(?<=['\"]).*?-service(?=['\"])" $SERVICE_NAMES_FILE)
)

# Function to get port for a service
get_port() {
  local service_name=$1
  local port_line
  port_line=$(grep -Po "(?<=${service_name}: )\d+" $SERVICE_PORTS_FILE || echo "3000")
  echo $port_line
}

for SERVICE in "${BACKEND_SERVICES[@]}"; do
  DIR="$BASE_DIR/apps/backend/$SERVICE"
  DOCKERFILE="$DIR/Dockerfile"

  mkdir -p "$DIR"

  # Fetch port from shared constants
  PORT=$(get_port $SERVICE)

  cat > "$DOCKERFILE" <<EOF
# ---------- Stage 1: Builder ----------
FROM base-builder AS builder
WORKDIR /app

ARG SERVICE_NAME
ENV SERVICE_NAME=${SERVICE}

# Build only this service
RUN npx nx build \$SERVICE_NAME --configuration=production

# ---------- Stage 2: Runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /app

ARG SERVICE_NAME
ENV SERVICE_NAME=${SERVICE}
ENV NODE_ENV=production

# Copy runtime package.json for this service
COPY --from=builder /app/dist/apps/backend/\$SERVICE_NAME/package.json ./package.json

# Install production dependencies
RUN npm ci --omit=dev

# Copy built service
COPY --from=builder /app/dist/apps/backend/\$SERVICE_NAME ./

# Copy Prisma schema and client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE $PORT
CMD ["node", "main.js"]
EOF

  echo "[INFO] Backend Dockerfile created for $SERVICE at $DOCKERFILE (port: $PORT)"
done

echo "[INFO] All backend Dockerfiles generated succes
