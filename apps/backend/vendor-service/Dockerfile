# syntax=docker/dockerfile:1
# IMPORTANT: Build from the repo root directory:
# docker build -t vendor-service -f apps/backend/vendor-service/Dockerfile .

ARG NODE_VERSION=18.20.8
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /usr/src/app

# Install dependencies
FROM base AS deps
# Copy root package.json + lock file from repo root into container
COPY package.json package-lock.json ./
RUN npm ci

# Build the service
FROM deps AS build
# Copy the entire repo into the container
COPY . ./
RUN npx nx build vendor-service

# Production image
FROM base AS final
ENV NODE_ENV=production
WORKDIR /usr/src/app

# Copy root-level package.json for runtime
COPY package.json ./
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist/apps/backend/vendor-service ./dist/

USER node
EXPOSE 3011
CMD ["node", "dist/main.js"]




# docker build -t vendor-service -f apps/backend/vendor-service/Dockerfile .
