#!/bin/bash

BASE_URL="http://localhost:3009/api/vendors"
VENDOR_EMAIL="swapnaadhav123@gmail.com"
VENDOR_PASSWORD="swapna@12"

echo "1️⃣ Initiate OTP"
curl -s -X POST "$BASE_URL/otp/initiate" \
-H "Content-Type: application/json" \
-d "{\"email\": \"$VENDOR_EMAIL\"}"
echo -e "\n"

echo "2️⃣ Verify OTP"
# Replace 123456 with the OTP you received
curl -s -X POST "$BASE_URL/otp/verify" \
-H "Content-Type: application/json" \
-d "{\"email\": \"$VENDOR_EMAIL\", \"otp\": \"123456\"}"
echo -e "\n"

echo "3️⃣ Complete Vendor Registration"
curl -s -X POST "$BASE_URL/register" \
-H "Content-Type: application/json" \
-d "{
  \"email\": \"$VENDOR_EMAIL\",
  \"password\": \"$VENDOR_PASSWORD\",
  \"name\": \"John Doe\",
  \"businessName\": \"John Store\",
  \"phone\": \"9876543210\",
  \"address\": \"123 Main St\"
}"
echo -e "\n"

echo "4️⃣ Login Vendor"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
-H "Content-Type: application/json" \
-d "{
  \"email\": \"$VENDOR_EMAIL\",
  \"password\": \"$VENDOR_PASSWORD\"
}")

JWT_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
echo "JWT Token: $JWT_TOKEN"
echo -e "\n"

echo "5️⃣ Get Vendor Profile"
# Replace <YOUR_VENDOR_ID> with the actual vendor ID from registration
curl -s -X GET "$BASE_URL/<YOUR_VENDOR_ID>" \
-H "Authorization: Bearer $JWT_TOKEN"
echo -e "\n"

echo "6️⃣ Update Vendor Profile"
curl -s -X PUT "$BASE_URL/<YOUR_VENDOR_ID>" \
-H "Authorization: Bearer $JWT_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "phone": "9998887777",
  "address": "456 New Address"
}'
echo -e "\n"

echo "7️⃣ Approve Vendor (Admin Only)"
curl -s -X POST "$BASE_URL/<YOUR_VENDOR_ID>/approve" \
-H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
echo -e "\n"

echo "8️⃣ Reject Vendor (Admin Only)"
curl -s -X POST "$BASE_URL/<YOUR_VENDOR_ID>/reject" \
-H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
echo -e "\n"

echo "9️⃣ Upload Vendor Profile Image"
curl -s -X POST "$BASE_URL/<YOUR_VENDOR_ID>/profile-image" \
-H "Authorization: Bearer $JWT_TOKEN" \
-F "file=@/path/to/image.jpg"
echo -e "\n"

echo "✅ All vendor endpoints tested"
