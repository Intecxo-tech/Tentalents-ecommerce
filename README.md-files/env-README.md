📦 Environment Variables — Overview

.env file is a central configuration for all services in your Nx monorepo e-commerce project. It allows services to run with consistent settings across local development, Docker, and CI/CD environments. Here’s a breakdown:

1️⃣ Database

DATABASE_URL: Connection string for PostgreSQL used by all services.

Contains host, database name, username, SSL settings, etc.

Example: postgresql://username:password@host:port/dbname

2️⃣ Swagger

SWAGGER_JSON_URL: URL where Swagger API docs are exposed.

Each service can generate API docs; this points to the main Swagger JSON.

3️⃣ Stripe Payments

STRIPE_PAYMENT_SECRET_KEY: Secret key for Stripe operations (payments, subscriptions).

STRIPE_WEBHOOK_SECRET: Validates incoming Stripe webhook requests.

Used for payment processing securely.

4️⃣ Frontend

FRONTEND_URL: Base URL of your frontend app.

Used for CORS, OAuth redirects, and links sent via email.

5️⃣ Firebase

FIREBASE_PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY: Credentials for Firebase services (like push notifications or Firestore).

Enables backend to interact securely with Firebase.

6️⃣ Kafka

KAFKA_BROKERS: Addresses of Kafka brokers.

KAFKAJS_NO_PARTITIONER_WARNING: Suppresses warnings in KafkaJS.

Used for event-driven communication between microservices.

7️⃣ Redis

REDIS_HOST, PORT, SENTINEL_NAME: Connection details for Redis (caching, session storage).

REDIS_PASSWORD: Authentication for Redis (not shown in docs for security).

8️⃣ MinIO

MINIO_ENDPOINT, PORT, ACCESS_KEY, SECRET_KEY, BUCKET: S3-compatible storage for files (images, invoices, KYC documents).

Services can upload/download files securely.

9️⃣ JWT Authentication

JWT_SECRET: Key used to sign and verify JWT tokens.

Enables secure authentication across all microservices.

🔟 Email (SendGrid)

SMTP settings for sending emails.

SMTP_HOST, PORT, USER: Host, port, and user for email server.

EMAIL_FROM: Default sender email for transactional emails.

1️⃣1️⃣ Cloudinary (Optional)

For storing media files in the cloud.

CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET: Credentials for media delivery.

1️⃣2️⃣ Per-Service Configurations

Each microservice has:

PORT: The port on which the service runs.

NAME: Service name.

DATABASE: Which database connection to use.

KAFKA client & group ID: For sending/receiving events.

Example pattern:

Service Name	Port	Kafka Client ID	Kafka Group ID
user-service	3012	user-service-client	user-service-group
product-service	3001	product-service-client	product-service-group
order-service	3002	order-service-client	order-service-group
...	...	...	...
