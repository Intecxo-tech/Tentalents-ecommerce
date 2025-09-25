# ---------- Stage 1: Builder ----------
FROM base-builder AS builder
WORKDIR /app

ARG SERVICE_NAME
ENV SERVICE_NAME=vendor-service

# Build only this service
RUN npx nx build $SERVICE_NAME --configuration=production

# ---------- Stage 2: Runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /app

ARG SERVICE_NAME
ENV SERVICE_NAME=vendor-service
ENV NODE_ENV=production

# Copy runtime package.json for this service
COPY --from=builder /app/dist/apps/backend/$SERVICE_NAME/package.json ./package.json

# Install production dependencies
RUN npm ci --omit=dev

# Copy built service
COPY --from=builder /app/dist/apps/backend/$SERVICE_NAME ./

# Copy Prisma schema and client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3000
CMD ["node", "main.js"]
