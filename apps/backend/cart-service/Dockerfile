# ---------- Dockerfile for cart-service ----------
# Uses root base Dockerfile image (tentalents)

# ---------- Stage 1: Builder ----------
FROM tentalents AS builder
WORKDIR /app

ENV SERVICE_NAME=cart-service
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NX_DAEMON=false

RUN npx nx build cart-service --configuration=production --skip-eslint

# ---------- Stage 2: Production ----------
FROM tentalents AS production
WORKDIR /app

ENV NODE_ENV=production
ENV SERVICE_NAME=cart-service
ENV PORT=3020

COPY --from=builder /app/dist/apps/backend/cart-service ./

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:$PORT/healthz || exit 1

EXPOSE 3020
CMD ["node", "main.cjs"]

# ---------- Docker commands ----------
# docker build -t cart-service:latest -f apps/backend/cart-service/Dockerfile apps/backend/cart-service

# docker rm -f cart-service
# docker run -d --name cart-service -p 3020:3020 --rm cart-service:latest
