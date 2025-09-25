#!/bin/bash

SERVICE_PORTS_FILE="libs/shared/constants/src/lib/service-ports.ts"

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

get_port() {
  local service_name="$1"
  local port=$(grep -oP "${service_name^^}[^:]*:\s*\K\d+" $SERVICE_PORTS_FILE)
  echo "${port:-3000}"
}

for service in "${SERVICES[@]}"; do
  DIR="apps/backend/$service"
  [ ! -d "$DIR" ] && echo "Skipping $service" && continue
  [ -f "$DIR/Dockerfile" ] && rm "$DIR/Dockerfile"

  PORT=$(get_port $service)

  echo "# ---------- Dockerfile for $service ----------
# Uses root base Dockerfile image (tentalents)

# ---------- Stage 1: Builder ----------
FROM tentalents AS builder
WORKDIR /app

ENV SERVICE_NAME=$service
ENV NODE_OPTIONS=\"--max-old-space-size=4096\"
ENV NX_DAEMON=false

RUN npx nx build $service --configuration=production --skip-eslint

# ---------- Stage 2: Production ----------
FROM tentalents AS production
WORKDIR /app

ENV NODE_ENV=production
ENV SERVICE_NAME=$service
ENV PORT=$PORT

COPY --from=builder /app/dist/apps/backend/$service ./

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:$PORT/health || exit 1

EXPOSE $PORT
CMD [\"node\", \"main.cjs\"]

# ---------- Docker commands ----------
# docker build -t $service:latest .
# docker rm -f $service
# docker run -d --name $service -p $PORT:$PORT --rm $service:latest" > "$DIR/Dockerfile"

  echo "Dockerfile generated for $service"
done
