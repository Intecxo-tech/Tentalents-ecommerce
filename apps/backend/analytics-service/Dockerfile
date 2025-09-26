# ---------- Dockerfile for analytics-service ----------
# Uses root base Dockerfile image (tentalents)

# ---------- Stage 1: Builder ----------
FROM tentalents AS builder
WORKDIR /app

ENV SERVICE_NAME=analytics-service
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NX_DAEMON=false

RUN npx nx build analytics-service --configuration=production --skip-eslint

# ---------- Stage 2: Production ----------
FROM tentalents AS production
WORKDIR /app

ENV NODE_ENV=production
ENV SERVICE_NAME=analytics-service
ENV PORT=3010

COPY --from=builder /app/dist/apps/backend/analytics-service ./

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:$PORT/healthz || exit 1

EXPOSE 3010
CMD ["node", "main.cjs"]

# ---------- Docker commands ----------
# docker build -t analytics-service:latest -f apps/backend/analytics-service/Dockerfile apps/backend/analytics-service

# docker rm -f analytics-service
# docker run -d --name analytics-service -p 3010:3010 --rm analytics-service:latest
