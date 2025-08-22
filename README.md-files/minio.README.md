 🧾 MinIO in the Nx E-Commerce Monorepo

## Introduction

In our e-commerce platform, we have multiple microservices (user-service, product-service, order-service, invoice-service, etc.) that need a reliable way to store and retrieve files such as:

- User avatars  
- Product images  
- Order invoices (PDFs)  
- Email attachments  
- Rating images  

We use **MinIO**, an S3-compatible object storage server, as our centralized storage solution. It allows services to interact with objects via HTTP APIs or the MinIO client (`mc`), enabling **scalable and decoupled file storage** for all microservices.

---

## Why MinIO?

- **S3-compatible**: Works with standard AWS SDKs and tools.  
- **Lightweight & fast**: Perfect for local development and production.  
- **Decoupled storage**: Microservices don't store files locally; all assets are centralized.  
- **Presigned URLs**: Securely provide temporary access to files.  

---

## How Our Monorepo Uses MinIO

Each microservice has its own dedicated bucket in MinIO:

| Service          | Bucket Name      | Folder Path                     | Example Usage |
|-----------------|----------------|--------------------------------|---------------|
| user-service     | user-files      | users/avatars/                 | Store user profile images |
| product-service  | product-files   | products/images/               | Store product images |
| rating-service   | rating-files    | ratings/images/                | Store rating images |
| email-service    | email-files     | emails/attachments/            | Store email attachments |
| invoice-service  | invoice-files   | invoices/pdf/                  | Store invoice PDFs |

**Example workflow:**

1. A user uploads a profile picture → user-service uploads to `user-files/users/avatars/`.  
2. A product is created with images → product-service uploads to `product-files/products/images/`.  
3. When generating an invoice → invoice-service uploads PDF to `invoice-files/invoices/pdf/`.  
4. Services can generate **presigned URLs** for temporary access without exposing private credentials.  

---

## Local Development Setup

### 1️⃣ Run MinIO

For local development, MinIO runs on `http://localhost:9000`:

```
docker run -p 9000:9000 \
  -e MINIO_ROOT_USER=minio \
  -e MINIO_ROOT_PASSWORD=minio123 \
  -v minio_data:/data \
  minio/minio server /data
2️⃣ Connect Using SDK or mc
Using MinIO Client (mc):




mc alias set localminio http://localhost:9000 minio minio123
Using Node SDK (example in services):

ts


import { Client } from 'minio';

const minioClient = new Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'minio',
  secretKey: 'minio123',
});
Presigned URLs
To provide secure, temporary access to objects (e.g., images or invoices):

ts


const url = await minioClient.presignedGetObject('product-files', 'products/images/product.jpg', 3600); // Expires in 1 hour
Bucket Management & Best Practices
Each microservice should have its own bucket.

Use folders to organize data by domain (users, products, invoices).

Avoid public access unless necessary.

For testing, you can reset buckets using mc:

mc rm --recursive --force localminio/product-files
mc mb localminio/product-files

Summary
MinIO provides a centralized, scalable, and S3-compatible storage solution for our Nx monorepo e-commerce platform. By integrating it across microservices, we ensure:

Files are securely stored

Access is controlled via presigned URLs

Microservices remain decoupled and maintainable




