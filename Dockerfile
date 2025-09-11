# ----------- Stage 1: Builder -----------
FROM node:20.10.0 AS builder
WORKDIR /app

# Copy package manifests and Nx base config
COPY package*.json tsconfig.base.json ./

# Install all dependencies (including devDependencies for Nx build)
RUN npm ci --legacy-peer-deps

# Copy all source code
COPY apps/ ./apps/
COPY libs/ ./libs/

# Disable Nx daemon & ESLint to avoid missing module errors in Docker
ENV NX_DAEMON=false
ENV NX_NO_ESLINT_PLUGIN=true

# Build only the specified service
ARG SERVICE_NAME
RUN npx nx build apps/backend/${SERVICE_NAME} --configuration=production --skip-nx-cache --no-eslint

# ----------- Stage 2: Runtime -----------
FROM node:20.10.0 AS runtime
WORKDIR /app

# Copy built service from builder stage
ARG SERVICE_NAME
COPY --from=builder /app/dist/apps/backend/${SERVICE_NAME} ./dist

# Copy package manifests for production install
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev --legacy-peer-deps

# Start the service
CMD ["node", "dist/main.js"]
