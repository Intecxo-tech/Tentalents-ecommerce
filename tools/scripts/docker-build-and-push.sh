#!/bin/bash

# List of services
services=(
  vendor-service
  admin-service
  invoice-service
  user-service
  product-service
  order-service
  rating-service
  email-service
  payment-service
  search-service
  cart-service
)

# Loop through each service
for service in "${services[@]}"; do
  echo "=============================="
  echo "Building $service..."
  docker build -t $service:latest -f apps/backend/$service/Dockerfile .

  echo "Tagging $service..."
  docker tag $service:latest ghcr.io/adhavswapna/$service:latest

  echo "Pushing $service..."
  docker push ghcr.io/adhavswapna/$service:latest

  echo "$service done!"
  echo "=============================="
done
