🐘 PostgreSQL + Supabase Setup — Nx E-Commerce Platform

This guide explains how to set up Supabase-hosted PostgreSQL for your Nx microservices, without Docker. Each service uses a dedicated schema in a single database for isolation.

1️⃣ Supabase Project Setup

Sign up at Supabase.

Create a new project:

Project name: e.g., tentalents-mvp

Database password: strong password

Region: closest to your location

After initialization, get your connection info:

DB Host

DB Port (default 5432)

DB Name

DB User

DB Password

2️⃣ Environment Variables (.env)
# Database URL (Supabase)
DATABASE_URL="postgresql://<DB_USER>:<DB_PASSWORD>@<DB_HOST>:5432/<DB_NAME>?sslmode=require"

# Service-specific DBs (with schema search_path)
USER_SERVICE_DB=${DATABASE_URL}?options=--search_path=user_service
PRODUCT_SERVICE_DB=${DATABASE_URL}?options=--search_path=product_service
ORDER_SERVICE_DB=${DATABASE_URL}?options=--search_path=order_service
RATING_SERVICE_DB=${DATABASE_URL}?options=--search_path=rating_service
EMAIL_SERVICE_DB=${DATABASE_URL}?options=--search_path=email_service
PAYMENT_SERVICE_DB=${DATABASE_URL}?options=--search_path=payment_service
SEARCH_SERVICE_DB=${DATABASE_URL}?options=--search_path=search_service
CART_SERVICE_DB=${DATABASE_URL}?options=--search_path=cart_service
ADMIN_SERVICE_DB=${DATABASE_URL}?options=--search_path=admin_service
INVOICE_SERVICE_DB=${DATABASE_URL}?options=--search_path=invoice_service
ANALYTICS_SERVICE_DB=${DATABASE_URL}?options=--search_path=analytics_service
VENDOR_SERVICE_DB=${DATABASE_URL}?options=--search_path=vendor_service


Each microservice uses its own schema for table isolation.

3️⃣ Creating Schemas

Connect via psql:

psql "${DATABASE_URL}"


Create schemas for each service:

CREATE SCHEMA user_service;
CREATE SCHEMA product_service;
CREATE SCHEMA order_service;
CREATE SCHEMA rating_service;
CREATE SCHEMA email_service;
CREATE SCHEMA payment_service;
CREATE SCHEMA search_service;
CREATE SCHEMA cart_service;
CREATE SCHEMA admin_service;
CREATE SCHEMA invoice_service;
CREATE SCHEMA analytics_service;
CREATE SCHEMA vendor_service;

4️⃣ Example Table Creation
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User service
CREATE TABLE user_service.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Product service
CREATE TABLE product_service.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);


Repeat for other services as needed.

5️⃣ Quick psql Commands
Action	Command
List tables	\dt
Describe a table	\d table_name
Quit psql	\q
Show current connection	\conninfo
Switch schema	SET search_path TO schema_name;
6️⃣ Backup & Restore
Backup
pg_dump "${DATABASE_URL}" > backup.sql

Restore
psql "${DATABASE_URL}" < backup.sql

7️⃣ Nx Microservices Mapping
Microservice	    Schema Name	    Example Tables	        Connection Env Variable
user-service	    user_service	  users, profiles	        USER_SERVICE_DB
product-service	  product_service	products, categories	  PRODUCT_SERVICE_DB
order-service	    order_service	  orders, order_items	    ORDER_SERVICE_DB
rating-service	  rating_service	ratings, reviews	      RATING_SERVICE_DB
email-service	    email_service	  email_logs, templates	  EMAIL_SERVICE_DB
payment-service	  payment_service	payments, transactions	PAYMENT_SERVICE_DB
search-service	  search_service	search_index, logs	    SEARCH_SERVICE_DB
cart-service	    cart_service	  carts, cart_items	      CART_SERVICE_DB
admin-service	    admins,         roles	                  ADMIN_SERVICE_DB
invoice-service	  invoice_service	invoices, invoice_items	INVOICE_SERVICE_DB
analytics-service	analytics_service	events, metrics	      ANALYTICS_SERVICE_DB
vendor-service	  vendor_service	vendors, vendor_products	VENDOR_SERVICE_DB

8️⃣ Benefits

No Docker needed — fully hosted DB.

Single DB for all microservices with schema isolation.

SSL enforced via sslmode=require.

Easy backups & restores with pg_dump and psql.

Works with Prisma, TypeORM, or raw SQL.

✅ This setup is ready for local development or cloud deployment.
All microservices remain isolated, but can share a single Supabase PostgreSQL instance.
