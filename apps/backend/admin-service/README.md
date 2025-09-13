# 🛡️ Admin Service — Multi-Vendor E-Commerce Platform

The Admin Service handles all moderation, governance, and internal operations for the e-commerce platform. It empowers internal users like admin and super_admin to review seller applications, moderate product listings, manage user roles, and track platform-wide activity.

This service is built within a modern Nx monorepo using scalable microservices architecture. It integrates Prisma ORM, Kafka (event-driven), RBAC via JWT, Redis, and OpenAPI docs to provide a robust and production-ready backend system.

---

## 📌 Core Responsibilities
- ✅ Approve or reject seller registrations
- ✅ Suspend or remove product listings
- ✅ Promote users to seller or admin roles
- ✅ Log all actions by admins (e.g. suspending a seller)
- ✅ Integrate with analytics-service for platform insights
- ✅ Enforce strict role-based access control (RBAC)

---

## 🧠 Domain Models (via Prisma Schema)

| Model       | Description                                   |
|------------|-----------------------------------------------|
| User       | Unified user record for buyers, sellers, admins |
| Seller     | Seller onboarding info with statuses: pending, approved, rejected |
| Admin      | Internal platform moderators with elevated permissions |
| Product    | Listings added by sellers, which can be moderated |
| ActionLog  | History of admin actions (optional audit trail) |

All models are managed in `prisma/schema.prisma` and automatically exposed via Prisma Client.

---

## 🧱 Tech Stack

| Tool        | Purpose                                      |
|------------|----------------------------------------------|
| Express.js  | Lightweight web framework                   |
| Prisma      | ORM for PostgreSQL                           |
| Nx Monorepo | Code organization and tooling                |
| Kafka (KRaft) | Event-driven message bus (planned)         |
| Redis       | Caching & token/session storage             |
| JWT Auth    | RBAC using @shared/auth                      |
| Swagger     | Interactive API docs (`/api/docs/admin`)    |
| Docker + K8s | Containerization and orchestration          |

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Run migrations
npx prisma migrate dev --name init

# 4. Start the service (Nx dev)
nx serve admin-service

Key API Endpoints
Method	Endpoint	Role	Description
GET	/admin/sellers	admin	List all sellers with statuses
POST	/admin/sellers/:id/approve	admin	Approve seller registration
POST	/admin/sellers/:id/reject	admin	Reject seller registration
PATCH	/admin/products/:id/suspend	admin	Suspend a product listing
PATCH	/admin/products/:id/activate	admin	Re-activate a suspended product
GET	/admin/logs	super_admin	View all admin action logs
GET	/healthz	-	Liveness probe
GET	/readiness	-	Readiness probe
GET	/api/docs/admin	-	Swagger documentation
🔐 Authentication & RBAC

This service uses JWT tokens validated by @shared/auth middleware:

authMiddleware(['admin', 'super_admin']);


Only users with allowed roles can access the admin routes.

📦 Project Structure
apps/admin-service/
├── src/
│   ├── app/         # Controllers, routes, logic
│   ├── main.ts      # Bootstraps the service
│   └── app.ts       # Express app with middleware
├── prisma/          # Prisma schema and migrations
├── project.json     # Nx config
└── README.md        # This file

🧪 Swagger Docs

Once the service is running:

http://localhost:3009/api/docs/admin

💻 Example cURL Requests

Replace JWT_TOKEN with a valid token from @shared/auth.

List all users
curl -X GET http://localhost:3009/admin/users \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json"

List all sellers
curl -X GET http://localhost:3009/admin/sellers/all \
  -H "Authorization: Bearer JWT_TOKEN"

List pending seller applications
curl -X GET http://localhost:3009/admin/sellers/pending \
  -H "Authorization: Bearer JWT_TOKEN"

Approve a seller
curl -X PUT http://localhost:3009/admin/sellers/status \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sellerId": "SELLER_ID",
    "status": "approved"
  }'

Reject a seller
curl -X PUT http://localhost:3009/admin/sellers/status \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sellerId": "SELLER_ID",
    "status": "rejected"
  }'

Promote a user role
curl -X PUT http://localhost:3009/admin/users/role \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "role": "seller"
  }'

Suspend a product listing
curl -X PATCH http://localhost:3009/admin/products/:id/suspend \
  -H "Authorization: Bearer JWT_TOKEN"

Activate a suspended product
curl -X PATCH http://localhost:3009/admin/products/:id/activate \
  -H "Authorization: Bearer JWT_TOKEN"

View all admin action logs (super_admin only)
curl -X GET http://localhost:3009/admin/logs \
  -H "Authorization: Bearer JWT_TOKEN"

Health check
curl -X GET http://localhost:3009/healthz

Readiness probe
curl -X GET http://localhost:3009/readiness

Swagger docs (browser)
open http://localhost:3009/api/docs/admin

✅ Summary for New Learners
Concept	What It Means
User model	Base entity for all roles: buyer, seller, admin
Seller model	Extra info for sellers requiring approval
Admin model	Elevated users allowed to moderate platform
Product model	Listings managed by sellers, moderated by admins
ActionLog	Logs every admin operation (e.g., rejecting seller, suspending product)
Enums	Standardized statuses (e.g. seller status, product visibility)