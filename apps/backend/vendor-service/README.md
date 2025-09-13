🛒 Vendor Service – Multi-Vendor E-Commerce Platform

The Vendor Service manages the lifecycle of sellers (vendors) in the marketplace. It handles vendor registration, onboarding (KYC / GST verification), product association, payouts, invoices, and vendor ratings.

📌 Responsibilities

✅ Register new vendors (store name, KYC, documents, etc.)

✅ Manage vendor status (pending, approved, rejected, suspended)

✅ Store and retrieve vendor KYC/GST documents (via MinIO)

✅ Link vendors to products, orders, invoices, and payouts

✅ Track ratings and feedback from buyers

✅ Emit Kafka events (vendor.created, vendor.status.updated)

🧠 Domain Models (Prisma Schema)
Model	Description
Vendor	Seller profile with store details, KYC documents, and approval status
User	Linked user account (role: VENDOR, CUSTOMER, ADMIN, etc.)
Product	Products listed by the vendor
Order	Orders fulfilled by the vendor
Payout	Payouts issued to vendor (earnings/revenue share)
Invoice	Invoices generated for vendor’s orders
Rating	Buyer reviews and ratings for vendors

📄 Prisma schema location:
apps/vendor-service/prisma/schema.prisma

🧱 Tech Stack

Framework: Express.js

ORM: Prisma (PostgreSQL)

Auth & RBAC: JWT-based (@shared/auth)

File Storage: MinIO (for vendor docs like KYC/GST)

Messaging: Kafka (vendor.created, vendor.status.updated)

Monitoring: Swagger, Prometheus

Containerization: Docker, Kubernetes

🚀 Getting Started
# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Run database migrations
npx prisma migrate dev --name init

# 4. Start the service
npm run start:dev

⚙️ Environment Variables (.env)
DATABASE_URL=postgresql://user:password@localhost:5432/vendor_service_db
JWT_SECRET=super_secret_jwt_key
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minio
MINIO_SECRET_KEY=minio123
MINIO_BUCKET=vendor-docs
KAFKA_BROKER=localhost:9092

📚 Key API Endpoints
Method	Endpoint	Role	Description
POST	/vendors	public	Register as a vendor (pending status)
GET	/vendors/:id	vendor	Get vendor profile
PATCH	/vendors/:id/status	admin	Approve, reject, or suspend a vendor
GET	/vendors/:id/products	vendor	List products belonging to a vendor
GET	/vendors/:id/orders	vendor	List orders fulfilled by the vendor
GET	/vendors/:id/payouts	vendor	View payout history
GET	/vendors/:id/ratings	public	View vendor ratings and reviews

🔒 Endpoints are protected with JWT + RBAC.

🧪 Testing
# Run unit tests
npm run test

# Open Prisma Studio
npx prisma studio

📦 Kafka Events

vendor.created → emitted when a new vendor registers

vendor.status.updated → emitted when admin updates vendor status

🗂 Folder Structure
apps/vendor-service/
├─ prisma/
│  └─ schema.prisma
├─ src/
│  ├─ app/
│  │  ├─ controllers/        # Express route handlers
│  │  ├─ routes/             # API route definitions
│  │  ├─ services/           # Business logic
│  │  ├─ schemas/            # Zod or Joi validation schemas
│  │  ├─ dtos/               # Data Transfer Objects
│  │  └─ index.ts            # App entry point
│  ├─ config/                # Environment & constants
│  ├─ middlewares/           # JWT, RBAC, error handling
│  └─ utils/                 # Shared helpers (MinIO, Kafka, etc.)
├─ tests/                    # Unit and integration tests
└─ package.json

🤝 Contribution Guidelines

We welcome contributions to improve the Vendor Service. Please follow these guidelines:

Fork & Clone

git clone <repo-url> && cd vendor-service


Create a Branch

git checkout -b feature/your-feature-name


Code Style

Use TypeScript & follow the existing project structure.

Follow shared type definitions from @shared/types.

Use Zod for input validation.

Testing

Write unit tests for new functionality in tests/.

Run all tests before committing:

npm run test


PR Guidelines

Provide a clear description of your changes.

Reference any related issues or tasks.

Ensure Kafka events, Prisma migrations, and environment changes are documented.

Code Review

PRs will be reviewed by core contributors.

Address all feedback and re-test before merging.

Following these practices helps maintain code quality, ensures consistency, and keeps the Vendor Service stable.

⚡ Developer Quick Tips
Kafka
# Start Kafka (docker-compose)
docker-compose up -d kafka

# Produce a test event
kafkacat -b localhost:9092 -t vendor.created -P <<< '{"id":"123","name":"Test Vendor"}'

# Consume events
kafkacat -b localhost:9092 -t vendor.status.updated -C

MinIO
# Start MinIO (docker-compose)
docker-compose up -d minio

# Upload a file via CLI
mc alias set localminio http://localhost:9000 minio minio123
mc cp ./kyc.pdf localminio/vendor-docs/kyc.pdf

# List files
mc ls localminio/vendor-docs

Prisma
# Generate client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Open Studio to view DB
npx prisma studio

Env & JWT

Make sure .env variables are set correctly.

JWT tokens are required for protected endpoints.

Roles: VENDOR, CUSTOMER, ADMIN, SUPER_ADMIN.

📣 API Testing with curl

🔒 Make sure to replace <JWT_TOKEN> with a valid token and <VENDOR_ID> / <ORDER_ID> etc. with actual IDs.

1️⃣ Register as a Vendor (Public)
curl -X POST http://localhost:3000/vendors \
-H "Content-Type: application/json" \
-d '{
  "storeName": "My Awesome Store",
  "userId": "user-123",
  "kycDocs": ["kyc1.pdf", "kyc2.pdf"]
}'

2️⃣ Get Vendor Profile (Vendor Role)
curl -X GET http://localhost:3000/vendors/<VENDOR_ID> \
-H "Authorization: Bearer <JWT_TOKEN>"

3️⃣ Update Vendor Status (Admin Role)
curl -X PATCH http://localhost:3000/vendors/<VENDOR_ID>/status \
-H "Authorization: Bearer <JWT_TOKEN>" \
-H "Content-Type: application/json" \
-d '{
  "status": "APPROVED"
}'


Status options: PENDING, APPROVED, REJECTED, SUSPENDED

4️⃣ List Vendor Products (Vendor Role)
curl -X GET http://localhost:3000/vendors/<VENDOR_ID>/products \
-H "Authorization: Bearer <JWT_TOKEN>"

5️⃣ List Vendor Orders (Vendor Role)
curl -X GET http://localhost:3000/vendors/<VENDOR_ID>/orders \
-H "Authorization: Bearer <JWT_TOKEN>"

6️⃣ View Vendor Payouts (Vendor Role)
curl -X GET http://localhost:3000/vendors/<VENDOR_ID>/payouts \
-H "Authorization: Bearer <JWT_TOKEN>"

7️⃣ View Vendor Ratings (Public)
curl -X GET http://localhost:3000/vendors/<VENDOR_ID>/ratings

🔑 Notes

JWT tokens are required for all endpoints except public endpoints (register and ratings).

Roles:

VENDOR → access to their own profile, products, orders, payouts

ADMIN → access to approve/reject/suspend vendors

MinIO stores KYC/GST files. File URLs are returned in the vendor profile.

Kafka events are automatically emitted on vendor registration (vendor.created) and status updates (vendor.status.updated).