# Kong API Gateway for Tentalents E-commerce

## What is Kong API Gateway?

Kong is a tool that sits in front of your backend services (microservices) and manages all the requests coming from users or apps. Instead of users calling each service directly, they talk to Kong, and Kong sends the requests to the right service.

Think of Kong as a smart traffic controller for your backend services.

---

## Why do we use Kong?

- **One entry point:** All API requests come through Kong, so clients don’t need to know about individual services.
- **Security:** Kong helps protect services by checking who can access what using authentication (like passwords or tokens).
- **Rate limiting:** Prevents too many requests from flooding your services.
- **CORS handling:** Makes it easy for frontend apps to talk to backend services securely.
- **Easy to add new features:** You can add plugins like logging, authentication, or analytics without changing your services.

---

## How Kong fits in our monorepo

Our project has many small services (like user-service, product-service, order-service, etc.). Kong handles the routing to these services and applies rules like who can call them and how often.

---

## How to use Kong in this project

1. **Generate Kong configuration**

   Run this command to create a configuration file (`kong.yml`) that tells Kong about all the services and routes:

docker rm -f kong


docker run -d --name kong \
  -e "KONG_DATABASE=off" \
  -e "KONG_DECLARATIVE_CONFIG=/kong/kong.yaml" \
  -v /infra/kong/kong.yaml:/kong/kong.yaml \
  -p 8000:8000 -p 8443:8443 \
  kong:3.4



   ```bash
   npm run generate:kong-config
Start Kong and all services

Use Docker Compose to start Kong and your backend services:

docker-compose -f infra/kong/docker-compose.yml up -d
Update Kong config

If you change service settings or add new routes, regenerate the config and restart Kong:

npm run generate:kong-config
docker-compose -f infra/kong/docker-compose.yml restart kong


Where to find important files
infra/kong/kong-config.js — List of services and their settings.

infra/kong/generate-config.js — Script to create kong.yml from your service list.

infra/kong/kong.yml — Configuration file Kong uses.

infra/kong/docker-compose.yml — Docker setup for Kong and services.

Summary
Kong helps us manage many backend services in one place — making it easier, safer, and faster for apps to use our APIs.

If you’re new to Kong, think of it like a gateway or front desk that welcomes requests, checks them, and sends them where they need to go.


curl commands  with Kong API Gateway for our microservices:

# 1. Call a service route without authentication (e.g., product service)
curl -i http://localhost:8000/product

# 2. C
all a service route with JWT authentication (e.g., admin service)
curl -i http://localhost:8000/admin \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"

# 3. Call a service route with CORS preflight OPTIONS request
curl -i -X OPTIONS http://localhost:8000/user \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET"

# 4. Call a rate-limited endpoint (e.g., search service)
curl -i http://localhost:8000/search

# 5. Get Kong Admin API status (if exposed)
curl -i http://localhost:8001/status

# 6. List all services configured in Kong (using Admin API)
curl -i http://localhost:8001/services

# 7. List all routes configured in Kong (using Admin API)
curl -i http://localhost:8001/routes

# 8. List all consumers (users) in Kong (using Admin API)
curl -i http://localhost:8001/consumers



Happy learning and coding with Kong and the Tentalents E-commerce platform! 🎉
