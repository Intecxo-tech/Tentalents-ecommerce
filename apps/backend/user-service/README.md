👤 User Service — Multi-Vendor E-Commerce Platform

The User Service manages user registration, login, authentication, profile management, and address handling. It supports OTP-based registration, Google OAuth login, role management, and integrates with Kafka for event-driven communication.

🚀 Features

User Registration & OTP Verification

Initiate, verify, and resend OTPs

Complete registration with secure password hashing

Authentication

JWT-based authentication

OAuth2 login (Google)

Profile Management

View and update profile details

Upload profile image

Role Management

Update user roles (buyer, seller, admin) — restricted to super_admin

Address Management

Save multiple addresses per user

Database & Caching

PostgreSQL with Prisma ORM

Redis caching for session and frequently accessed data

Event-Driven Architecture

Kafka events: user.created, user.vendor_registered, user.updated

Documentation

Swagger docs available at /api/docs/user

📦 Installation
cd apps/user-service
npm install

⚡ Running Locally
# Start the development server
npm run dev


Environment variables needed:

DATABASE_URL (PostgreSQL)

REDIS_URL

JWT_SECRET

FIREBASE_ADMIN_CREDENTIALS (for Google OAuth)

Kafka connection details

🛠️ API Endpoints & cURL Examples (Port 3018)
Authentication & Registration

Initiate OTP

curl -X POST http://localhost:3018/api/users/register/initiate-otp \
-H "Content-Type: application/json" \
-d '{"email":"user@example.com"}'


Verify OTP

curl -X POST http://localhost:3018/api/users/register/verify-otp \
-H "Content-Type: application/json" \
-d '{"email":"user@example.com","otp":"123456"}'


Resend OTP

curl -X POST http://localhost:3018/api/users/register/resend-otp \
-H "Content-Type: application/json" \
-d '{"email":"user@example.com"}'


Complete Registration

curl -X POST http://localhost:3018/api/users/register/complete \
-H "Content-Type: application/json" \
-d '{"email":"user@example.com","password":"securePass123","name":"John Doe"}'


Login

curl -X POST http://localhost:3018/api/users/login \
-H "Content-Type: application/json" \
-d '{"email":"user@example.com","password":"securePass123"}'


Google OAuth Login

curl -X POST http://localhost:3018/api/users/oauth-login \
-H "Content-Type: application/json" \
-d '{"provider":"google","idToken":"<GOOGLE_ID_TOKEN>"}'

User Profile

Get Profile

curl -X GET http://localhost:3018/api/users/profile \
-H "Authorization: Bearer <JWT_TOKEN>"


Update Profile

curl -X PATCH http://localhost:3018/api/users/profile \
-H "Authorization: Bearer <JWT_TOKEN>" \
-H "Content-Type: application/json" \
-d '{"name":"John Updated","phone":"1234567890"}'


Update Profile Image

curl -X PATCH http://localhost:3018/api/users/profile/image \
-H "Authorization: Bearer <JWT_TOKEN>" \
-F "avatar=@/path/to/image.jpg"

Role Management

Update User Role (super_admin only)

curl -X PATCH http://localhost:3018/api/users/<USER_ID>/role \
-H "Authorization: Bearer <SUPER_ADMIN_JWT>" \
-H "Content-Type: application/json" \
-d '{"role":"seller"}'

Address Management

Save Address

curl -X POST http://localhost:3018/api/users/address \
-H "Authorization: Bearer <JWT_TOKEN>" \
-H "Content-Type: application/json" \
-d '{
  "name": "Home",
  "phone": "9876543210",
  "line1": "123 Street",
  "line2": "Apt 4B",
  "city": "City",
  "state": "State",
  "country": "Country",
  "pinCode": "123456",
  "addressType": "home"
}'

🧩 Sample User Workflow (Port 3018)

Initiate OTP → /register/initiate-otp

Verify OTP → /register/verify-otp

Complete Registration → /register/complete

Login → /login (get JWT)

Get Profile → /profile

Update Profile → /profile

Upload Profile Image → /profile/image

Save Address → /address

All steps are demonstrated in the cURL examples above.

🔑 Super Admin Workflow — Update User Role

Login as Super Admin → /login (get JWT)

Get target user profile → /profile (optional)

Update role → /:id/role (roles: buyer, seller, admin)

This triggers a Kafka event user.vendor_registered if updating to seller.

📚 Technologies

Node.js + Express

TypeScript

Prisma ORM + PostgreSQL

Redis caching

Kafka for event-driven messaging

Multer for file uploads

Swagger for API documentation
