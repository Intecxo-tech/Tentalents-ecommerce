# ---------- Dockerfile for vendor-service ----------
# Uses root base Dockerfile image (tentalents)

# ---------- Stage 1: Builder ----------
FROM tentalents AS builder
WORKDIR /app

ENV SERVICE_NAME=vendor-service
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NX_DAEMON=false

RUN npx nx build vendor-service --configuration=production --skip-eslint

# ---------- Stage 2: Production ----------
FROM tentalents AS production
WORKDIR /app

ENV NODE_ENV=production
ENV SERVICE_NAME=vendor-service
ENV PORT=3011

COPY --from=builder /app/dist/apps/backend/vendor-service ./

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:$PORT/health || exit 1

EXPOSE 3011
CMD ["node", "main.cjs"]

# ---------- Docker commands ----------
# docker build -t vendor-service:latest .
# docker rm -f vendor-service
# docker run -d --name vendor-service -p 3011:3011 --rm vendor-service:latest
