# # ---------- Base builder for all services ----------
# FROM node:20-alpine AS base-builder
# WORKDIR /app

# # Set production environment for base layer
# ENV NODE_ENV=development

# # Copy root package files first for caching
# COPY package.json package-lock.json tsconfig.base.json nx.json ./

# # Install all dependencies including dev for Nx builds
# RUN npm ci

# # Copy the entire monorepo for Nx to resolve all paths
# COPY . .

# # Pre-generate Prisma client for all services
# RUN npx prisma generate --schema=./prisma/schema.prisma

# # Optional: prebuild shared Nx libs (speed up service builds)
# # Uncomment if you have common shared libs
# # RUN npx nx build shared --configuration=production

# # Verify base build is ready
# RUN ls -la node_modules ./


# ---------- Base builder for all services ----------
FROM node:20-alpine AS base-builder
WORKDIR /app

ENV NODE_ENV=development
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Install dependencies needed by Prisma
RUN apk add --no-cache openssl libc6-compat

# Copy only root configs + prisma schema first (for caching)
COPY package.json package-lock.json tsconfig.base.json nx.json ./ 
COPY prisma ./prisma

# Install all dependencies (skip scripts to avoid double prisma engine installs)
RUN npm ci --ignore-scripts

# ✅ Generate Prisma client (schema path is inside /app/prisma/schema.prisma)
RUN npx prisma generate --schema=/app/prisma/schema.prisma

# Copy the rest of the monorepo
COPY . .

# Debug check
RUN ls -la /app/prisma && ls -la /app/node_modules/.prisma/client && echo "✅ Prisma client generated"
