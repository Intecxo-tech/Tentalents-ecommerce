🚀 main.ts — Service Bootstrapper & Lifecycle Manager
The main.ts file for each service:

Loads environment variables with dotenv

Creates a Prisma Client instance and connects to the DB

Connects to Redis cache and manages connection lifecycle

Sets up Kafka Producer & Consumer clients subscribing to service-specific topics

Defines Kafka message handlers for async event processing

Starts the Express HTTP server

Handles graceful shutdown on SIGINT, SIGTERM, cleaning up Kafka, Redis, Prisma, and HTTP server

Example Responsibilities
Concern Description
🌍 Env Setup Loads .env configuration
🛢️ Prisma DB Connects/disconnects Prisma Client
🧠 Redis Cache Connects Redis, manages client lifecycle
📨 Kafka Events Produces & consumes typed Kafka messages
🔁 Graceful Shutdown Cleans up infra & HTTP server on signals
🧪 Kafka Message Handler Domain-specific event processing logic

🧩 Shared Libraries Used Across Services
Library Purpose
@shared/logger Consistent logging with levels and context
@shared/redis Redis client wrappers and cache helpers
@shared/kafka Typed Kafka producer & consumer abstractions
@shared/swagger Swagger/OpenAPI documentation setup
@shared/error Centralized error and 404 middleware
@shared/auth JWT Auth, role guards, and RBAC middleware
@shared/middleware Common Express middlewares (CORS, helmet)
@shared/constants Shared Kafka topics, ports, and other enums

🔐 Optional Role-Based Access Control (RBAC)
Services that expose admin or protected APIs use @shared/auth middlewares:

ts

import { requireAuth, requireRole } from '@shared/auth';

app.use('/admin', requireAuth, requireRole(['ADMIN']), adminRoutes);
🧪 Testing Tips
Use Supertest to write integration tests for app.ts.

Mock Kafka and Redis clients during tests.

Test graceful shutdown scenarios to avoid dangling connections.

Use the Swagger UI to verify API endpoints and request schemas.

🧹 Graceful Shutdown Example
ts

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

async function shutdown() {
logger.info('🛑 Shutting down service...');
await prisma.$disconnect();
if (redisClient.status === 'ready') await redisClient.quit();
await disconnectKafkaProducer();
await disconnectKafkaConsumer();
server?.close(() => process.exit(0));
}
How to Run a Service Locally
Configure .env with service-specific environment variables.

Ensure dependencies are running: Kafka, Redis, PostgreSQL, MinIO.

Build shared libs and service:
npx nx build shared-logger shared-redis shared-kafka <service-name>

Start the service:
node dist/apps/<service-name>/main.js
Access Swagger UI at http://localhost:<port>/api/docs/<service-name>.

Summary
Component Responsibility
app.ts Express app setup & routes
main.ts Service lifecycle & infrastructure orchestration

This modular design ensures:

Code reuse & shared standards via @shared/\* libs
Easy scalability across microservices
Centralized infrastructure handling and error management
Consistent API documentation via Swagger
Robust event-driven architecture with Kafka
