
# ---------- Stage 1: Builder ----------
# ---------- Base builder for all services ----------
FROM node:20-alpine AS base-builder
WORKDIR /app

# Build-time environment
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
RUN ls -la /app/prisma \
 && ls -la /app/node_modules/.prisma/client \
 && echo "✅ Prisma client generated"


# docker build -t tentalents .
