🟢 Redis — In-Memory Data Store for Nx Monorepo E-Commerce

Redis is an open-source, in-memory key-value store used for caching, session storage, rate limiting, pub/sub messaging, and more. In our e-commerce Nx monorepo, Redis helps speed up services, reduce DB load, and provide shared state between microservices.

1️⃣ Installation
Docker (Recommended for Dev)
docker run -d --name redis \
  -p 6379:6379 \
  -v redis-data:/data \
  redis:7

macOS
brew install redis
brew services start redis

Linux
sudo apt update
sudo apt install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

2️⃣ Connecting to Redis
Using Redis CLI
redis-cli
ping          # Should return PONG

Using Node.js (ioredis)
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: 0,
});

await redis.set('key', 'value');
const value = await redis.get('key');
console.log(value); // "value"

3️⃣ Redis Usage in Monorepo Microservices

We use Redis in multiple services:

Service	Usage
user-service	Session management, JWT blacklisting
cart-service	Caching cart items per user
product-service	Product inventory caching
order-service	Order state caching for fast retrieval
analytics-service	Event queueing / counters
admin-service	Rate limiting & monitoring metrics
4️⃣ Common Commands
Keys
KEYS *          # List all keys
DEL key         # Delete a key
EXPIRE key 60   # Set TTL of 60 seconds
TTL key         # Check TTL

Strings
SET key value
GET key
INCR counter
DECR counter

Hashes
HSET user:1 name "John"
HGET user:1 name
HGETALL user:1

Lists
LPUSH queue job1
RPUSH queue job2
LPOP queue
RPOP queue
LRANGE queue 0 -1

Sets
SADD users:active 1
SREM users:active 1
SMEMBERS users:active

Pub/Sub
SUBSCRIBE channel1
PUBLISH channel1 "Hello world"

5️⃣ Redis Sentinel & Cluster (Optional)

For high availability:

docker run -d --name redis-sentinel \
  -p 26379:26379 \
  redis:7 redis-sentinel /etc/redis/sentinel.conf


For clustering, Redis supports sharding across nodes. Useful for large-scale e-commerce traffic.

6️⃣ Redis in Our Monorepo Shared Library

We maintain a shared Redis library under libs/shared/redis with utilities:

getClient() — initializes and exports Redis client

setCache(key, value, ttl) — stores JSON-serializable data

getCache(key) — retrieves and parses JSON

deleteCache(key) — removes cache

rateLimiter(key, limit, window) — microservice rate limiting

Optional Sentinel support for HA

Example usage:

import { redisClient, setCache, getCache } from '@shared/redis';

await setCache('cart:123', { items: 3 }, 300);
const cart = await getCache('cart:123');
console.log(cart.items); // 3


7️⃣ Best Practices

Use TTL for cached data to avoid stale entries.
Avoid KEYS* in production — use SCAN for large datasets.
Store JSON for complex objects.
Use separate DBs or key prefixes per service to avoid collisions.
Monitor memory usage to prevent eviction issues.
Integrate with Prometheus + Grafana for Redis metrics.

