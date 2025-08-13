# syntax=docker/dockerfile:1
# IMPORTANT: Build from repo root:
# docker build -t vendor-service -f apps/backend/vendor-service/Dockerfile .

ARG NODE_VERSION=18.20.8
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /usr/src/app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
COPY . .
RUN npx nx build vendor-service

FROM base AS final
ENV NODE_ENV=production
WORKDIR /usr/src/app

# Copy root-level files
COPY package.json ./
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist/apps/backend/vendor-service ./dist

USER node
EXPOSE 3011
CMD ["node", "dist/main.js"]
