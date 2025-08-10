🛒 MVP E-Commerce Platform (HKTVmall Style - Nx Monorepo)

This project is a full-stack, event-driven e-commerce platform inspired by HKTVmall, built using Nx Monorepo, Express.js microservices, and a modern DevOps stack featuring Docker, Kubernetes, Helm, and more.
🧰 Tools Overview
Tool Purpose
Nx Monorepo management for all microservices and frontend
Docker & Compose Local container orchestration
Kubernetes (kind) Container orchestration for dev/prod environments
Helm & Helmfile Kubernetes package management and multi-chart deployments
Prisma ORM Declarative DB schema and migrations per service
Kafka (KRaft) Event streaming and async service communication
Redis Sentinel Caching and distributed memory support
Swagger (OpenAPI) API documentation and UI per microservice
Trivy Docker image vulnerability scanning
Falco Runtime Kubernetes security monitoring
MinIO S3-compatible object storage
Keycloak OAuth2 / OpenID Connect identity provider
Prometheus Metrics collection and monitoring
Grafana Visualization dashboards
Loki Centralized log aggregation
Jaeger Distributed tracing for observability
GitHub Actions CI/CD pipelines, Preview Env deployments, and cleanup workflows
🏁 Developer Setup
1️⃣ Install Tools (One-Time Setup)

chmod +x scripts/tools-setup.sh
./scripts/tools-setup.sh

Installs:

    Node.js, npm, Docker, Docker Compose

    Redis CLI, Prisma CLI, Kafka CLI (KRaft)

    Helm, Helmfile, Swagger CLI

    Trivy, Falco, GitHub CLI

    MinIO, Keycloak (via Docker)

2️⃣ Start Core Infrastructure

docker-compose up -d

Runs:

    PostgreSQL (multi-DB)

    Redis Sentinel

    Kafka (KRaft mode)

    MinIO

    Keycloak

3️⃣ Install Node Dependencies

pnpm install

# or

npm install

4️⃣ Setup Prisma for Each Service

# Example for user-service

npx prisma generate --schema=apps/user-service/prisma/schema.prisma
npx prisma migrate dev --name init --schema=apps/user-service/prisma/schema.prisma

Repeat for each DB-based microservice.
5️⃣ Run Microservices

npx nx serve user-service
npx nx serve product-service

# or run all

npx nx run-many --target=serve --all

6️⃣ Access Swagger Docs

Each service exposes Swagger UI at:

http://localhost:3000/api/docs/user
http://localhost:3001/api/docs/product
http://localhost:3002/api/docs/order
...

7️⃣ Check Health Endpoints

curl http://localhost:3000/healthz

8️⃣ Run Security Checks (Optional)

Trivy:

trivy image yourorg/user-service:latest

Falco:

falco -c infra/security/falco.yaml

🧭 API Gateway: NGINX Ingress

Uses NGINX Ingress (via Helm) to:

    Route traffic to appropriate microservices

    Serve Swagger UIs

    Integrate with OAuth2 Proxy (Keycloak-based auth)

No Kong/Tyk needed unless scaling to production enterprise traffic.
📂 Project Structure

apps/
user-service/
product-service/
order-service/
...
shared/
config/
error/
logger/
auth/
swagger/
infra/
helmfile/
ingress/
microservices/
monitoring/
database/
security/

✅ CI/CD: GitHub Actions

    Lint, test, Docker build

    Deploy only affected services

    Preview environments per PR

    Auto-cleanup on PR close

📚 Documentation

    docs/swagger.md → API design and guidelines

    docs/kafka.md → Event topics and messaging patterns

    docs/auth.md → OAuth2 / RBAC integration

    docs/observability.md → Logs, metrics, tracing (Loki, Prometheus, Jaeger)

📦 Prisma + PostgreSQL Per Microservice
🧱 DB Architecture Overview

Each microservice uses:

    A dedicated PostgreSQL database

    Its own schema.prisma

    Independent migration history and .env

apps/
├─ user-service/
│ ├─ prisma/
│ │ ├─ schema.prisma
│ │ └─ migrations/
│ └─ .env
├─ product-service/
│ ├─ prisma/
│ └─ ...
...

🛠️ Prisma Setup Per Service

1. Install Prisma

npm install prisma --save-dev
npm install @prisma/client

2. Add .env

# apps/user-service/.env

DATABASE_URL="postgresql://mvp_ecom_user:mvp_ecom_pass@localhost:5432/user_service_db"

3. Initialize Schema & Migration

npx prisma migrate dev --name init
npx prisma generate

4. Useful Prisma Commands
   Command Description
   npx prisma generate Generates Prisma client
   npx prisma migrate dev Runs and applies migrations
   npx prisma studio Opens DB UI in browser
   npx prisma validate Validates schema
   npx prisma format Formats schema file
   npx prisma migrate reset Dev reset for DB + migrations
   🧪 Seed Script Example

// apps/user-service/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seed() {
await prisma.user.create({
data: {
email: 'admin@site.com',
name: 'Admin',
password: 'hashedpass'
}
});
}

seed();

Run it:

npx ts-node prisma/seed.ts

✅ Per-Service Benefits of Prisma + PostgreSQL
Service Purpose Benefits
user-service Auth & identity Data isolation, secure storage, decoupled from business logic
product-service Product catalog SEO-safe schema, fast search, no cart/order coupling
order-service Manages user orders Transaction safety, rollback via relations, checkout logic
payment-service Payment records PCI-friendly separation, gateway-specific metadata
rating-service Product feedback Aggregation, anti-spam, event-based product score updates
email-service Email logs Retry tracking, email audit, isolated from user-service
search-service Search logs Query insight, personalized recs, high-insert handling
cart-service Temporary cart state Stateless sessions, parallel writes, auto-expiry
invoice-service PDF invoice tracking Secure MinIO storage, audit-ready, independently archived
analytics-service Platform events Exportable event logs, JSON-flexible schema, powers BI insights
admin-service Admin panel + RBAC Secure role management, scoped access, logs for governance
🧠 Best Practices

    Use one database per service

    Never share DB credentials across services

    Commit prisma/migrations for consistency

    Prefer Kafka events over cross-schema joins

    Keep .env out of source control

📚 Further Reading

    Prisma Docs

    PostgreSQL Docs

    Nx Docs

    Kafka Event Design

    API Standards

commands
npm install --save-dev @types/node

<!-- JWT token generate script with:


npm install jsonwebtoken
npm install --save-dev @types/jsonwebtoken

npm run generate:jwt -->


for gitlab-cli

sudo apt install gh



To update a few secrets only, you can manually run:

gh secret set SECRET_NAME --repo your-org/your-repo -b "secret_value"
To automate in CI pipelines, add gh setup and run this script in your 


Docker compose command 
docker compose -f infra/docker/docker-compose.infrastructure.yml -f infra/docker/docker-compose.microservices.yml up -d --build
