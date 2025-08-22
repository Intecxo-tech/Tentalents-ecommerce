🛒 E-Commerce Nx Monorepo — Project Overview

This repository contains a full-stack, event-driven e-commerce platform built with Nx Monorepo architecture. It is designed for microservices-based development, scalability, and maintainability.

The platform consists of:

Frontend apps for users and sellers
Backend apps implementing core microservices
Post-MVP services for advanced features

🏗️ Monorepo Structure
Frontend
App Name	Description
user-ui	Customer-facing web application
seller-ui	Seller/vendor management dashboard
Backend
Core Microservices
Service Name	Description
analytics-service	Event tracking & analytics
admin-service	Admin dashboard & system control
vendor-service	Vendor onboarding & management
invoice-service	Invoice generation & management
user-service	User management & authentication
product-service	Product catalog & inventory
order-service	Order processing & management
rating-service	Product rating & review system
email-service	Email notifications & campaigns
payment-service	Payment processing & gateway
search-service	Search functionality & indexing
cart-service	Shopping cart & session management
Post-MVP Services
Service Name	Description
post-mvp-services	Placeholder for future enhancements
cms-service	Content management system
recommendation-service	Product recommendation engine
coupon-service	Coupon & discount management
refund-service	Refund handling & processing
⚡ Getting Started
1. Install Dependencies
# Install root dependencies
npm install

2. Running Frontend Apps
# User UI
npx nx serve user-ui
# Seller UI
npx nx serve seller-ui


Visit in browser:

User UI: http://localhost:4200/user-ui

Seller UI: http://localhost:4200/seller-ui

3. Running Backend Services
# Example: Start user-service
npx nx serve user-service
# Start all core services
npx nx run-many --target=serve --all


Default service ports are configured per service in libs/shared/constants/service-ports.ts.

🗄️ Database Configuration

The backend services connect to PostgreSQL / Supabase databases. Add your database URL to .env:

DATABASE_URL="postgresql://username:password@host:port/dbname?sslmode=require"


Other environment variables:

SWAGGER_JSON_URL=http://localhost:<port>

📦 Microservices Communication

Kafka: Event-driven messaging between microservices

Redis: Caching & session storage

MinIO: File storage (invoices, KYC docs)

Kafka topics and event types are centralized in libs/shared/kafka.

📜 API Documentation

All backend services expose Swagger documentation:

# Install Swagger packages if not installed
npm install swagger-ui-express swagger-jsdoc

# Run the backend service
npx nx serve <service-name>

# Visit in browser
http://localhost:<service-port>/api-docs

🛠️ Developer Notes

Shared libraries are located under libs/shared for reusable logic (auth, Kafka, Redis, MinIO, utils, etc.)

Nx CLI allows running, building, and testing apps efficiently

Use npx nx graph to visualize the dependency graph

🔮 Future Plans

Expand post-MVP services: CMS, recommendations, coupons, refunds

Add mobile frontend apps for iOS/Android

Improve monitoring with Prometheus/Grafana and observability tools