✅ Essential Redis Commands for Your Project


# 🔍 Check Redis is running (no auth)
redis-cli PING
# → Response: PONG

# 🔐 Connect to Redis with password (if set)
redis-cli -a <your_password>

# 🔐 Connect with user (ACL) + password (if ACL is enabled)
redis-cli --user redis_user -a redis_password

# 🧠 Get/set a key (for testing or debugging)
SET test_key "hello"
GET test_key

# 🗂️ View cache or session data (e.g. tokens, sessions, product cache)
KEYS *              # List all keys (use only in dev!)
GET user:123        # Replace with actual key pattern
HGETALL session:456 # For session stored as hash

# ⏱️ Set expiry and TTL checks
EXPIRE user:123 3600  # Set key to expire in 1 hour
TTL user:123          # Check time left before expiry

# ❌ Delete specific keys
DEL user:123
DEL session:456

# 🧼 Clear all data (dev-only)
FLUSHALL

# 👀 Monitor Redis operations (live debugging)
MONITOR

# 📊 Redis stats for health check
INFO
INFO memory
CLIENT LIST

# 🧪 Pub/Sub (if used)
PUBLISH channel_name "test"
SUBSCRIBE channel_name
🧠 Common Use Cases in Your Project
Use Case	Redis Command Example
Health Check	PING, INFO, CLIENT LIST
Debug Cache (e.g. Product)	GET product:123, TTL product:123
Session Debug (e.g. Auth)	HGETALL session:token_id, DEL session:*
Clear Dev Cache	FLUSHALL (⚠️ use only in dev)
Watch Live Traffic	MONITOR
Check Redis Sentinel Nodes	redis-cli -p 26379 INFO Sentinel