🛒 Tentalents E-Commerce Platform — Prisma Setup

This repository contains the Prisma schemas and database structure for the Tentalents Multi-Vendor Marketplace. Each microservice manages its own PostgreSQL database with type-safe access via Prisma Client.

✅ Microservices List

Backend Services

admin-service

vendor-service

invoice-service

user-service

product-service

order-service

rating-service

email-service

payment-service

search-service

cart-service

analytics-service (Event Tracking)

coupon-service (Discounts & Coupons, Post-MVP)

cms-service (Static Pages, Post-MVP)

refund-service (Refund Flow, Post-MVP)

recommendation-service (Personalized Recommendations, Post-MVP)

🧾 Overview — Prisma Schema Design

Modular Architecture: Each microservice has its own schema.prisma and isolated PostgreSQL database.

Type-Safe Access: Prisma Client generates types based on schema for maintainable and safe queries.

Event-Driven: Integrated with Kafka for async messaging (order.created, product.uploaded, etc.).

Relational Integrity: Uses relations, enums, and cascade rules for robust data models.

Multi-Vendor Support: Products can be listed by multiple sellers with independent stock & pricing.

RBAC Ready: Buyer, Seller, Admin, and Super Admin roles with JWT middleware support.

MinIO Integration: Stores images, invoices, and seller documents.


⚡ Setup

Install Prisma

npm install @prisma/client prisma


Environment Variables

DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database>?schema=public"


Generate Prisma Client
npx prisma generate
Run Migrations
npx prisma migrate dev --name init


Introspect Existing DB (Optional)

npx prisma db pull

🏷️ Microservice Schemas
1️⃣ Admin-Service — Moderation & Platform Control

Tracks admin actions and seller/product moderation.

Enums: AdminRole, ModerationActionType, TargetType, ModerationStatus

Models: Admin, ActionLog


2️⃣ Vendor-Service — Seller Onboarding & KYC

Manages vendor signup, store profiles, and documents.

Enums: VendorStatus

Models: Vendor


3️⃣ Invoice-Service — Seller Invoices

Generates PDF invoices for each vendor per order.

Models: Invoice

Enum: OrderStatus (from order-service)


4️⃣ User-Service — User Accounts & RBAC

Manages buyers, sellers, and admin accounts.

Enums: UserRole, SellerStatus

Models: User, Seller


5️⃣ Product-Service — Listings & Variants

Multi-seller listings with price and stock per seller.

Enums: ProductListingStatus

Models: Product, ProductListing


6️⃣ Order-Service — Buyer Orders & Items

Tracks orders split by seller with detailed item lifecycle.

Enums: OrderStatus, ItemStatus

Models: Order, OrderItem


7️⃣ Rating-Service — Product & Seller Reviews

Buyers rate products and sellers post-purchase.

Models: Rating


8️⃣ Email-Service — Notifications

Tracks OTPs, confirmations, and invoice emails.

Enum: EmailEventType

Models: EmailLog


9️⃣ Payment-Service — Payment Tracking

Records payments with mock or real gateway IDs.

Enums: PaymentStatus, PaymentMethod

Models: Payment


🔟 Search-Service — User Search Logs

Captures keywords for analytics & personalization.

Models: SearchLog


1️⃣1️⃣ Cart-Service — Buyer Carts

Tracks items in buyer carts across multiple sellers.

Models: CartItem


1️⃣2️⃣ Analytics-Service — Event Tracking

Tracks user activity and platform events.

Models: EventLog


Post-MVP Services

Coupon-Service — Discounts & Coupons (Coupon, CouponType, CouponScope)

CMS-Service — Static pages (Page)

Refund-Service — Post-order refunds (RefundRequest, RefundStatus)

Recommendation-Service — Personalized product recommendations (Recommendation)

🔧 Best Practices

Separate DB per Microservice: Isolated schemas prevent accidental coupling.

Use Prisma Enums: Enforce valid states and roles in the database.

Cascade Rules: Use onDelete: Cascade for dependent entities.

Indexes: Add indexes for frequently queried fields (e.g., userId, productId).

Event-Driven Updates: Update caches, search, and analytics via Kafka events.


This README.md ensures developers understand how Prisma schemas are structured per microservice, how to generate the client, and the best practices for managing the e-commerce platform’s databases.