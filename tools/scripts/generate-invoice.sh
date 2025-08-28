#!/bin/bash

ORDER_ID=$1
API_URL=${API_URL:-http://localhost:3002}

if [ -z "$ORDER_ID" ]; then
  echo "Usage: $0 <orderId>"
  exit 1
fi

# Call TS script to get IDs
PRISMA_OUTPUT=$(npx ts-node tools/scripts/get-order-ids.ts "$ORDER_ID")

# Check if order exists
if [ "$PRISMA_OUTPUT" == "{}" ]; then
  echo "Order $ORDER_ID not found!"
  exit 1
fi

# Extract IDs without jq
USER_ID=$(echo $PRISMA_OUTPUT | node -pe 'JSON.parse(require("fs").readFileSync(0,"utf-8")).userId')
VENDOR_ID=$(echo $PRISMA_OUTPUT | node -pe 'JSON.parse(require("fs").readFileSync(0,"utf-8")).vendorId')

echo "Order: $ORDER_ID"
echo "Vendor: $VENDOR_ID"
echo "User: $USER_ID"

# Call Cloudinary invoice API
curl -X POST "$API_URL/api/cloudinary-orders/$ORDER_ID" \
-H "Content-Type: application/json" \
-d "{\"vendorId\":\"$VENDOR_ID\",\"userId\":\"$USER_ID\"}"
