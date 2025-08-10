version: "3.8"

services:
  postgres:
    image: postgres:15
    container_name: postgres
    restart: unless-stopped
    env_file:
      - ../../.env
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - backend

  redis:
    image: redis:7
    container_name: redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    env_file:
      - ../../.env
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 5s
      timeout: 3s
      retries: 10
    networks:
      - backend

  redis-sentinel-0:
    image: redis:7
    container_name: redis-sentinel-0
    restart: unless-stopped
    command: redis-server /etc/redis/sentinel.conf --sentinel
    volumes:
      - ../../libs/shared/redis/src/lib/sentinel-0.conf:/etc/redis/sentinel.conf:ro
    depends_on:
      - redis
    ports:
      - "26379:26379"
    networks:
      - backend

  kafka:
    image: bitnami/kafka:3.7.0
    container_name: kafka
    restart: unless-stopped
    ports:
      - "9092:9092"
    environment:
      KAFKA_CFG_NODE_ID: 1
      KAFKA_CFG_PROCESS_ROLES: controller,broker
      KAFKA_CFG_CONTROLLER_QUORUM_VOTERS: 1@kafka:9093
      KAFKA_CFG_LISTENERS: PLAINTEXT://:9092,CONTROLLER://:9093
      KAFKA_CFG_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
      KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,CONTROLLER:PLAINTEXT
      KAFKA_CFG_CONTROLLER_LISTENER_NAMES: CONTROLLER
      KAFKA_CFG_INTER_BROKER_LISTENER_NAME: PLAINTEXT
    networks:
      - backend

  kafka-ui:
    image: provectuslabs/kafka-ui:latest
    container_name: kafka-ui
    restart: unless-stopped
    ports:
      - "8081:8080"
    environment:
      KAFKA_CLUSTERS_0_NAME: local-kafka
      KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: kafka:9092
    depends_on:
      - kafka
    networks:
      - backend

  minio:
    image: minio/minio
    container_name: minio
    restart: unless-stopped
    env_file:
      - ../../.env
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    command: server --console-address ":9001" /data
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio-data:/data
    networks:
      - backend

  swagger-ui:
    image: swaggerapi/swagger-ui
    container_name: swagger
    restart: unless-stopped
    env_file:
      - ../../.env
    environment:
      SWAGGER_JSON_URL: ${SWAGGER_JSON_URL}
    ports:
      - "8080:8080"
    networks:
      - backend

volumes:
  pgdata:
  redis-data:
  minio-data:

networks:
  backend:
    driver: bridge


# ─── Infrastructure Commands ────────────────────────────────────────────────
# 📌 All commands assume you run them from the repo root

# 🚀 Start all infrastructure services
# docker compose -f infra/docker/docker-compose.infrastructure.yml up -d

# 🔄 Restart all services
# docker compose -f infra/docker/docker-compose.infrastructure.yml restart

# 🛑 Stop & remove all services
# docker compose -f infra/docker/docker-compose.infrastructure.yml down

# 🧼 Stop & remove services + volumes
# docker compose -f infra/docker/docker-compose.infrastructure.yml down -v

# 🧱 Rebuild images & start
# docker compose -f infra/docker/docker-compose.infrastructure.yml up -d --build

# 🔍 View live logs
# docker compose -f infra/docker/docker-compose.infrastructure.yml logs -f

# 🐳 Status of running containers
# docker compose -f infra/docker/docker-compose.infrastructure.yml ps

# 📥 Pull latest images
# docker compose -f infra/docker/docker-compose.infrastructure.yml pull

# ─── Run Specific Services ──────────────────────────────────────────────────
# 🚀 Only Redis
# docker compose -f infra/docker/docker-compose.infrastructure.yml up -d redis

# 🚀 Only Redis + Sentinel
# docker compose -f infra/docker/docker-compose.infrastructure.yml up -d redis redis-sentinel-0

# 🚀 Only Postgres
# docker compose -f infra/docker/docker-compose.infrastructure.yml up -d postgres

# 🚀 Only Kafka + Kafka UI
# docker compose -f infra/docker/docker-compose.infrastructure.yml up -d kafka kafka-ui

# 🚀 Only MinIO
# docker compose -f infra/docker/docker-compose.infrastructure.yml up -d minio

# 🚀 Only Swagger UI
# docker compose -f infra/docker/docker-compose.infrastructure.yml up -d swagger-ui


version: "3.9"

services:
  user-service:
    build:
      context: apps/backend/user-service
      dockerfile: Dockerfile
    container_name: user-service
    ports:
      - "${USER_SERVICE_PORT:-3000}:3000"
    networks:
      - microservices

  product-service:
    build:
      context: apps/backend/product-service
      dockerfile: Dockerfile
    container_name: product-service
    ports:
      - "${PRODUCT_SERVICE_PORT:-3001}:3001"
    networks:
      - microservices

  order-service:
    build:
      context: apps/backend/order-service
      dockerfile: Dockerfile
    container_name: order-service
    ports:
      - "${ORDER_SERVICE_PORT:-3002}:3002"
    networks:
      - microservices

  rating-service:
    build:
      context: apps/backend/rating-service
      dockerfile: Dockerfile
    container_name: rating-service
    ports:
      - "${RATING_SERVICE_PORT:-3003}:3003"
    networks:
      - microservices

  email-service:
    build:
      context: apps/backend/email-service
      dockerfile: Dockerfile
    container_name: email-service
    ports:
      - "${EMAIL_SERVICE_PORT:-3004}:3004"
    networks:
      - microservices

  payment-service:
    build:
      context: apps/backend/payment-service
      dockerfile: Dockerfile
    container_name: payment-service
    ports:
      - "${PAYMENT_SERVICE_PORT:-3005}:3005"
    networks:
      - microservices

  search-service:
    build:
      context: apps/backend/search-service
      dockerfile: Dockerfile
    container_name: search-service
    ports:
      - "${SEARCH_SERVICE_PORT:-3006}:3006"
    networks:
      - microservices

  cart-service:
    build:
      context: apps/backend/cart-service
      dockerfile: Dockerfile
    container_name: cart-service
    ports:
      - "${CART_SERVICE_PORT:-3007}:3007"
    networks:
      - microservices

  admin-service:
    build:
      context: apps/backend/admin-service
      dockerfile: Dockerfile
    container_name: admin-service
    ports:
      - "${ADMIN_SERVICE_PORT:-3008}:3008"
    networks:
      - microservices

  invoice-service:
    build:
      context: apps/backend/invoice-service
      dockerfile: Dockerfile
    container_name: invoice-service
    ports:
      - "${INVOICE_SERVICE_PORT:-3009}:3009"
    networks:
      - microservices

  analytics-service:
    build:
      context: apps/backend/analytics-service
      dockerfile: Dockerfile
    container_name: analytics-service
    ports:
      - "${ANALYTICS_SERVICE_PORT:-3010}:3010"
    networks:
      - microservices

  vendor-service:
    build:
      context: apps/backend/vendor-service
      dockerfile: Dockerfile
    container_name: vendor-service
    ports:
      - "${VENDOR_SERVICE_PORT:-3011}:3011"
    networks:
      - microservices

networks:
  microservices:
    driver: bridge

# # Start all microservices (build + run)
# docker compose -f infra/docker/docker-compose.microservices.yml up --build -d

# # Stop and remove all containers
# docker compose -f infra/docker/docker-compose.microservices.yml down

# # Start only user-service
# docker compose -f infra/docker/docker-compose.microservices.yml up --build -d user-service

# # Start only product-service
# docker compose -f infra/docker/docker-compose.microservices.yml up --build -d product-service

# # Start only order-service
# docker compose -f infra/docker/docker-compose.microservices.yml up --build -d order-service

# # Start only rating-service
# docker compose -f infra/docker/docker-compose.microservices.yml up --build -d rating-service

# # Start only email-service
# docker compose -f infra/docker/docker-compose.microservices.yml up --build -d email-service

# # Start only payment-service
# docker compose -f infra/docker/docker-compose.microservices.yml up --build -d payment-service

# # Start only search-service
# docker compose -f infra/docker/docker-compose.microservices.yml up --build -d search-service

# # Start only cart-service
# docker compose -f infra/docker/docker-compose.microservices.yml up --build -d cart-service

# # Start only admin-service
# docker compose -f infra/docker/docker-compose.microservices.yml up --build -d admin-service

# # Start only invoice-service
# docker compose -f infra/docker/docker-compose.microservices.yml up --build -d invoice-service

# # Start only analytics-service
# docker compose -f infra/docker/docker-compose.microservices.yml up --build -d analytics-service

# # Start only vendor-service
# docker compose -f infra/docker/docker-compose.microservices.yml up --build -d vendor-service


Ecommerce Project
This repository contains the backend microservices and infrastructure setup for the Ecommerce platform using Docker Compose.

Contents
Infrastructure Services

Microservices

Setup and Usage

Environment Variables

Useful Commands

Troubleshooting

Infrastructure Services
The infrastructure stack includes:

Postgres (Database)

Redis (Cache and Session Store)

Redis Sentinel (High Availability)

Kafka (Event Streaming)

Kafka UI (Kafka Management UI)

MinIO (S3-Compatible Object Storage)

Swagger UI (API Documentation)

These are defined in:

infra/docker/docker-compose.infrastructure.yml

Microservices
The backend microservices include:

user-service

product-service

order-service

rating-service

email-service

payment-service

search-service

cart-service

admin-service

invoice-service

analytics-service

vendor-service

These are defined in:

infra/docker/docker-compose.microservices.yml

Setup and Usage
Prerequisites
Docker Engine and Docker Compose (v2+) installed

Your .env file with all required environment variables present at the root of the repository

Starting Infrastructure
Start all infrastructure services in detached mode:

bash
Copy
Edit
docker compose -f infra/docker/docker-compose.infrastructure.yml up -d
Stop and remove all infrastructure containers:

bash
Copy
Edit
docker compose -f infra/docker/docker-compose.infrastructure.yml down
Starting Microservices
Start all backend microservices (build and run):

bash
Copy
Edit
docker compose -f infra/docker/docker-compose.microservices.yml up --build -d
Stop and remove all microservices containers:

bash
Copy
Edit
docker compose -f infra/docker/docker-compose.microservices.yml down
Starting Individual Services
You can start or stop individual services by specifying the service name. For example, to start only the user-service:

bash
Copy
Edit
docker compose -f infra/docker/docker-compose.microservices.yml up --build -d user-service
To start only Kafka and Kafka UI infrastructure services:

bash
Copy
Edit
docker compose -f infra/docker/docker-compose.infrastructure.yml up -d kafka kafka-ui
Environment Variables
Make sure you have a .env file at the root of the repo containing all necessary environment variables such as:

env
Copy
Edit
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password
REDIS_PASSWORD=your_redis_password
MINIO_ACCESS_KEY=your_minio_access_key
MINIO_SECRET_KEY=your_minio_secret_key
SWAGGER_JSON_URL=http://localhost:3000/api-docs.json
USER_SERVICE_PORT=3000
PRODUCT_SERVICE_PORT=3001
# ... other service ports and secrets
The Docker Compose files reference this .env file for sensitive configs.

Useful Commands
Infrastructure
bash
Copy
Edit
# Restart all infrastructure services
docker compose -f infra/docker/docker-compose.infrastructure.yml restart

# View logs for all infrastructure
docker compose -f infra/docker/docker-compose.infrastructure.yml logs -f

# Pull latest images
docker compose -f infra/docker/docker-compose.infrastructure.yml pull
Microservices
bash
Copy
Edit
# Restart all microservices
docker compose -f infra/docker/docker-compose.microservices.yml restart

# View logs for all microservices
docker compose -f infra/docker/docker-compose.microservices.yml logs -f

# View logs for a specific microservice (e.g. user-service)
docker compose -f infra/docker/docker-compose.microservices.yml logs -f user-service
Troubleshooting
.env file not found: Make sure you run commands from the project root where .env exists.

Ports conflict: Ensure ports defined in .env are free or change them accordingly.

Docker Compose version warnings: Remove deprecated version field if any.

File paths: Compose files expect relative paths as defined; ensure you do not move files without adjusting paths.

Additional Tips
Use docker compose ps to check running containers and their status.

Use docker compose exec <service> sh to enter a running container shell.

Regularly back up your Postgres and MinIO data volumes (pgdata, minio-data).




helmDefaults:
  wait: true
  timeout: 600
  createNamespace: true

repositories:
  # Add repos if your charts depend on them
  # Usually not needed if your microservices charts are custom/local
  # - name: bitnami
  #   url: https://charts.bitnami.com/bitnami

releases:
  - name: user-service
    namespace: user-service
    chart: ./infra/helm/tentalents-ecommerce-platform/microservices/user-service
    values:
      - ./infra/helm/tentalents-ecommerce-platform/microservices/user-service/values.yaml

  - name: product-service
    namespace: product-service
    chart: ./infra/helm/tentalents-ecommerce-platform/microservices/product-service
    values:
      - ./infra/helm/tentalents-ecommerce-platform/microservices/product-service/values.yaml

  - name: order-service
    namespace: order-service
    chart: ./infra/helm/tentalents-ecommerce-platform/microservices/order-service
    values:
      - ./infra/helm/tentalents-ecommerce-platform/microservices/order-service/values.yaml

  - name: rating-service
    namespace: rating-service
    chart: ./infra/helm/tentalents-ecommerce-platform/microservices/rating-service
    values:
      - ./infra/helm/tentalents-ecommerce-platform/microservices/rating-service/values.yaml

  - name: email-service
    namespace: email-service
    chart: ./infra/helm/tentalents-ecommerce-platform/microservices/email-service
    values:
      - ./infra/helm/tentalents-ecommerce-platform/microservices/email-service/values.yaml

  - name: payment-service
    namespace: payment-service
    chart: ./infra/helm/tentalents-ecommerce-platform/microservices/payment-service
    values:
      - ./infra/helm/tentalents-ecommerce-platform/microservices/payment-service/values.yaml

  - name: search-service
    namespace: search-service
    chart: ./infra/helm/tentalents-ecommerce-platform/microservices/search-service
    values:
      - ./infra/helm/tentalents-ecommerce-platform/microservices/search-service/values.yaml

  - name: cart-service
    namespace: cart-service
    chart: ./infra/helm/tentalents-ecommerce-platform/microservices/cart-service
    values:
      - ./infra/helm/tentalents-ecommerce-platform/microservices/cart-service/values.yaml

  - name: admin-service
    namespace: admin-service
    chart: ./infra/helm/tentalents-ecommerce-platform/microservices/admin-service
    values:
      - ./infra/helm/tentalents-ecommerce-platform/microservices/admin-service/values.yaml

  - name: invoice-service
    namespace: invoice-service
    chart: ./infra/helm/tentalents-ecommerce-platform/microservices/invoice-service
    values:
      - ./infra/helm/tentalents-ecommerce-platform/microservices/invoice-service/values.yaml

  - name: analytics-service
    namespace: analytics-service
    chart: ./infra/helm/tentalents-ecommerce-platform/microservices/analytics-service
    values:
      - ./infra/helm/tentalents-ecommerce-platform/microservices/analytics-service/values.yaml

  - name: vendor-service
    namespace: vendor-service
    chart: ./infra/helm/tentalents-ecommerce-platform/microservices/vendor-service
    values:
      - ./infra/helm/tentalents-ecommerce-platform/microservices/vendor-service/values.yaml




# # Add/update Helm repos (if any)
# helmfile -f helmfile-microservices.yaml repos

# # Lint all charts
# helmfile -f helmfile-microservices.yaml lint

# # Sync (install/upgrade) all microservices releases
# helmfile -f helmfile-microservices.yaml apply

# # Template render all charts (dry-run)
# helmfile -f helmfile-microservices.yaml template

# # Destroy all releases (uninstall)
# helmfile -f helmfile-microservices.yaml destroy
