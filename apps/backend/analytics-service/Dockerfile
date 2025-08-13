# syntax=docker/dockerfile:1
# IMPORTANT: Build from repo root:
# docker build -t analytics-service -f apps/backend/analytics-service/Dockerfile .

ARG NODE_VERSION=18.20.8
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /usr/src/app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
COPY . .
RUN npx nx build analytics-service

FROM base AS final
ENV NODE_ENV=production
WORKDIR /usr/src/app

# Copy root-level files
COPY package.json ./
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist/apps/backend/analytics-service ./dist

USER node
EXPOSE 3010
CMD ["node", "dist/main.js"]
