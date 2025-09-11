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
ARG SERVICE_NAME=admin-service
RUN npx nx build apps/backend/$SERVICE_NAME --configuration=production --skip-nx-cache --no-eslint

# ---------------- Runtime Stage ----------------
FROM node:20.10.0 AS runtime
WORKDIR /app

ARG SERVICE_NAME=admin-service
COPY --from=builder /app/dist/apps/backend/$SERVICE_NAME ./dist
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev --legacy-peer-deps

CMD ["node", "dist/main.js"]
