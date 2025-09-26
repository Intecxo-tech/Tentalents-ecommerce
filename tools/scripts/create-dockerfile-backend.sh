#!/usr/bin/env bash
set -e

SERVICE_PORTS_FILE="libs/shared/constants/src/lib/service-ports.ts"
SERVICE_NAMES_FILE="libs/shared/constants/src/lib/service-names.ts"

# List of services (matches the keys in SERVICE_NAMES enum)
SERVICES=(
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

# Map shell-friendly service name to TS enum key
declare -A SERVICE_ENUM_MAP=(
  ["user-service"]="USER"
  ["product-service"]="PRODUCT"
  ["order-service"]="ORDER"
  ["rating-service"]="RATING"
  ["email-service"]="EMAIL"
  ["payment-service"]="PAYMENT"
  ["search-service"]="SEARCH"
  ["cart-service"]="CART"
  ["admin-service"]="ADMIN"
  ["invoice-service"]="INVOICE"
  ["analytics-service"]="ANALYTICS"
  ["vendor-service"]="VENDOR"
)

get_port() {
  local service="$1"
  local enum_name="${SERVICE_ENUM_MAP[$service]}"

  # extract the port number using grep and sed
  local port=$(grep -oP "\[SERVICE_NAMES\.${enum_name}\]\s*:\s*\K\d+" "$SERVICE_PORTS_FILE")
  echo "${port:-3000}"
}

for service in "${SERVICES[@]}"; do
  DIR="apps/backend/$service"
  if [ ! -d "$DIR" ]; then
    echo "Skipping $service (directory not found)"
    continue
  fi

  [ -f "$DIR/Dockerfile" ] && rm "$DIR/Dockerfile"
  PORT=$(get_port "$service")

  cat > "$DIR/Dockerfile" <<EOL
# ---------- Dockerfile for $service ----------
# Uses root base Dockerfile image (tentalents)

# ---------- Stage 1: Builder ----------
FROM tentalents AS builder
WORKDIR /app

ENV SERVICE_NAME=$service
ENV NODE_OPTIONS="--max-old-space-size=4096"
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
  CMD wget --no-verbose --tries=1 --spider http://localhost:\$PORT/health || exit 1

EXPOSE $PORT
CMD ["node", "main.cjs"]

# ---------- Docker commands ----------
# docker build -t $service:latest .
# docker rm -f $service
# docker run -d --name $service -p $PORT:$PORT --rm $service:latest
EOL

  echo "Dockerfile generated for $service on port $PORT"
done
