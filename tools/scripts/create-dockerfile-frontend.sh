#!/bin/bash
# Script to generate per-frontend-service Dockerfiles using base-builder
# Usage: ./tools/scripts/create-dockerfile-frontend.sh

set -e

FRONTEND_SERVICES=(
  "user-ui"
  "seller-ui"
)

BASE_DIR="$(pwd)"

for SERVICE in "${FRONTEND_SERVICES[@]}"; do
  DIR="$BASE_DIR/apps/frontend/$SERVICE"
  DOCKERFILE="$DIR/Dockerfile"

  mkdir -p "$DIR"

  cat > "$DOCKERFILE" <<EOF
# ---------- Stage 1: Builder ----------
FROM base-builder AS builder
WORKDIR /app

ARG SERVICE_NAME
ENV SERVICE_NAME=${SERVICE}

# Build only this frontend
RUN npx nx build \$SERVICE_NAME

# ---------- Stage 2: Runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /app

ARG SERVICE_NAME
ENV SERVICE_NAME=${SERVICE}
ENV NODE_ENV=production

# Copy built frontend
COPY --from=builder /app/dist/apps/frontend/\$SERVICE_NAME ./

# Copy package.json for prod dependencies
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
RUN npm ci --omit=dev

EXPOSE 3000
CMD ["npx", "serve", "-s", "."]
EOF

  echo "[INFO] Frontend Dockerfile created for $SERVICE at $DOCKERFILE"
done

echo "[INFO] All frontend Dockerfiles generated successfully!"




# chmod +x tools/scripts/create-dockerfile-backend.sh
# chmod +x tools/scripts/create-dockerfile-frontend.sh
