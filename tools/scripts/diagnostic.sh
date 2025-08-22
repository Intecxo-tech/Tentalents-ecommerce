#!/bin/bash
echo "=== Starting Diagnostics with .env ==="

# Load .env variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  echo "✅ Loaded .env file"
else
  echo "❌ .env file not found!"
  exit 1
fi

# 1️⃣ Test Postgres DB
echo -n "Testing Postgres DB... "
if PGPASSWORD=$DATABASE_PASSWORD psql -h $DATABASE_HOST -U $DATABASE_USER -d $DATABASE_NAME -c "\q" >/dev/null 2>&1; then
  echo "✅ OK"
else
  echo "❌ FAILED"
fi

# 2️⃣ Test Redis
echo -n "Testing Redis... "
if redis-cli -u $REDIS_URL ping >/dev/null 2>&1; then
  echo "✅ OK"
else
  echo "❌ FAILED"
fi

# 3️⃣ Test /api/cart route
echo -n "Testing /api/cart route... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -H "Origin: $FRONTEND_URL" "$CART_SERVICE_URL/api/cart")
if [ "$RESPONSE" == "200" ]; then
  echo "✅ OK (HTTP $RESPONSE)"
else
  echo "❌ FAILED (HTTP $RESPONSE)"
fi

echo "=== Diagnostics Complete ==="
