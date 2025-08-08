# 1. Build stage: build your app with full deps and tooling
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Copy package.json and package-lock.json for caching
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy the rest of your code
COPY . .

# Build your app (adjust this command if needed)
RUN npm run build vendor-service

# 2. Production stage: copy built code and install only prod deps
FROM node:20-bookworm-slim AS production

WORKDIR /app

# Copy package.json and package-lock.json for production deps install
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built app from builder
COPY --from=builder /app/dist ./dist

# Expose your app port
EXPOSE 3000

# Run the built app
CMD ["node", "dist/main.js"]
