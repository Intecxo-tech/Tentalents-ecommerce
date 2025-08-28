#!/bin/bash

ORDER_ID=$1
API_URL=${API_URL:-http://localhost:3009}  # Update to your running invoice-service port

if [ -z "$ORDER_ID" ]; then
  echo "Usage: $0 <orderId>"
  exit 1
fi

# --- Hardcoded IDs for testing ---
# Replace these with real IDs once DB is back
USER_ID="221820a1-3f99-4a29-b9b7-f41f85359949"
VENDOR_ID="28801612-d8f7-45d1-8c86-5ac8769ecacb"
USER_NAME="Test User"
USER_EMAIL="testuser@example.com"

echo "Order: $ORDER_ID"
echo "Vendor: $VENDOR_ID"
echo "User: $USER_ID"

# Call Cloudinary invoice API
curl -X POST "$API_URL/api/cloudinary-invoices" \
-H "Content-Type: application/json" \
-d "{
  \"orderId\": \"$ORDER_ID\",
  \"vendorId\": \"$VENDOR_ID\",
  \"userId\": \"$USER_ID\",
  \"userName\": \"$USER_NAME\",
  \"userEmail\": \"$USER_EMAIL\"
}"