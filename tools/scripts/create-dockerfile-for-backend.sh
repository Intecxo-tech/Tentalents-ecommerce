#!/bin/bash
set -e

# Paths to constants
NAMES_FILE="libs/shared/constants/src/lib/service-names.ts"
PORTS_FILE="libs/shared/constants/src/lib/service-ports.ts"

BASE_DIR="apps/backend"

# --- Parse service names ---
declare -A NAME_MAP

# Extract lines inside SERVICE_NAMES enum block
names_lines=$(sed -n '/export enum SERVICE_NAMES {/,/}/p' "$NAMES_FILE" | grep -E "^[[:space:]]*[A-Z_]+\s*=")

while IFS= read -r line; do
  enum_key=$(echo "$line" | sed -E "s/^\s*([A-Z_]+)\s*=.*$/\1/")
  service_name=$(echo "$line" | sed -E "s/^\s*[A-Z_]+\s*=\s*'([^']+)'.*$/\1/")
  NAME_MAP["$enum_key"]="$service_name"
done <<< "$names_lines"

# --- Parse service ports ---
ports_lines=$(sed -n '/SERVICE_PORTS/,/};/p' "$PORTS_FILE" | grep -E "\[SERVICE_NAMES\.[A-Z_]+\]")

while IFS= read -r line; do
  enum_key=$(echo "$line" | sed -E "s/.*\[SERVICE_NAMES\.([A-Z_]+)\].*/\1/")
  port=$(echo "$line" | sed -E "s/.*:\s*([0-9]+),?.*/\1/")

  service="${NAME_MAP[$enum_key]}"

  if [ -z "$service" ]; then
    echo "Warning: No service name found for enum key '$enum_key', skipping."
    continue
  fi

  # Create folder in apps/backend/service instead of service-service
  service_dir="$BASE_DIR/${service}"
  mkdir -p "$service_dir"
  dockerfile_path="$service_dir/Dockerfile"

  echo "Generating Dockerfile for $service on port $port..."

  cat > "$dockerfile_path" <<EOF
# syntax=docker/dockerfile:1

ARG NODE_VERSION=18.20.8

FROM node:\${NODE_VERSION}-alpine as base
WORKDIR /usr/src/app

FROM base as deps
RUN --mount=type=bind,source=package.json,target=package.json \\
    --mount=type=bind,source=package-lock.json,target=package-lock.json \\
    --mount=type=cache,target=/root/.npm \\
    npm ci --omit=dev

FROM deps as build
RUN --mount=type=bind,source=package.json,target=package.json \\
    --mount=type=bind,source=package-lock.json,target=package-lock.json \\
    --mount=type=cache,target=/root/.npm \\
    npm ci

COPY . .

RUN npx nx build backend/${service}

FROM base as final
ENV NODE_ENV=production
WORKDIR /usr/src/app
USER node

COPY package.json .
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist/apps/backend/${service} ./dist

EXPOSE $port

CMD ["node", "dist/main.js"]
EOF

done <<< "$ports_lines"

echo "All Dockerfiles generated!"
