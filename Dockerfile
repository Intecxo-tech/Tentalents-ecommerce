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

# Use development environment for building
ENV NODE_ENV=development

# Increase memory for Nx (optional but recommended for large repos)
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Copy only root configs and lock files first for better caching
COPY package.json package-lock.json tsconfig.base.json nx.json prisma ./ 

# Install all dependencies (including dev for building)
RUN npm ci

# Copy the rest of the monorepo source
COPY . .

# Pre-generate Prisma client for all services (from root schema)
RUN npx prisma generate --schema=./prisma/schema.prisma

# (Optional) Prebuild shared libraries to speed up service builds
# RUN npx nx build shared --configuration=production --skip-nx-cache --skip-eslint

# List installed modules for debugging
RUN ls -la node_modules ./ && echo "✅ Base builder ready for all services"

# Example build command for testing this base image:
# docker build -t tentalents .


# #  docker build -t tentalents .