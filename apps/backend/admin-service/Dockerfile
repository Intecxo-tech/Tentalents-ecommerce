# ---------- Dockerfile for admin-service ----------
# Uses root base Dockerfile image (tentalents)

# ---------- Stage 1: Builder ----------
FROM tentalents AS builder
WORKDIR /app

ENV SERVICE_NAME=admin-service
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NX_DAEMON=false

RUN npx nx build admin-service --configuration=production --skip-eslint

# ---------- Stage 2: Production ----------
FROM tentalents AS production
WORKDIR /app

ENV NODE_ENV=production
ENV SERVICE_NAME=admin-service
ENV PORT=3008

COPY --from=builder /app/dist/apps/backend/admin-service ./

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:$PORT/health || exit 1

EXPOSE 3008
CMD ["node", "main.cjs"]

# ---------- Docker commands ----------
# docker build -t admin-service:latest .
# docker rm -f admin-service
# docker run -d --name admin-service -p 3008:3008 --rm admin-service:latest
