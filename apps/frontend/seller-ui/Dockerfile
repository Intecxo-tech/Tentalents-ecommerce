# ---------- Stage 1: Builder ----------
FROM base-builder AS builder
WORKDIR /app

ARG SERVICE_NAME
ENV SERVICE_NAME=seller-ui

# Build only this frontend
RUN npx nx build $SERVICE_NAME

# ---------- Stage 2: Runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /app

ARG SERVICE_NAME
ENV SERVICE_NAME=seller-ui
ENV NODE_ENV=production

# Copy built frontend
COPY --from=builder /app/dist/apps/frontend/$SERVICE_NAME ./

# Copy package.json for prod dependencies
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
RUN npm ci --omit=dev

EXPOSE 3000
CMD ["npx", "serve", "-s", "."]
