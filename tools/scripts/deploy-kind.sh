#!/bin/bash
set -e

# -------------------------------
# Config
# -------------------------------
CLUSTER_NAME="tentalent-ecommerce"

# List of services in your monorepo
services=(
  "admin-service"
  "vendor-service"
  "invoice-service"
  "user-service"
  "product-service"
  "order-service"
  "rating-service"
  "email-service"
  "payment-service"
  "search-service"
  "cart-service"
)

# Base paths
BACKEND_PATH="./apps/backend"
HELMFILE_PATH="./helmfile.yaml"  # Adjust if your helmfile is elsewhere
K8S_INFRA_PATH="./infra/k8s"     # Kubernetes manifests for Postgres, Redis, Kafka, MinIO

# -------------------------------
# Step 0: Create Kind cluster if it doesn't exist
# -------------------------------
if ! kind get clusters | grep -q "$CLUSTER_NAME"; then
  echo "Creating Kind cluster: $CLUSTER_NAME..."
  kind create cluster --name "$CLUSTER_NAME"
else
  echo "Kind cluster $CLUSTER_NAME already exists."
fi

# -------------------------------
# Step 1: Deploy infrastructure
# -------------------------------
echo "--------------------------------------"
echo "Deploying infrastructure: Postgres, Redis, Kafka, MinIO..."
kubectl apply -f "$K8S_INFRA_PATH"

# Wait for infra pods to be ready
echo "Waiting for infrastructure pods..."
kubectl wait --for=condition=Ready pods --all -n default --timeout=360s

# -------------------------------
# Step 2: Build and load Docker images
# -------------------------------
for service in "${services[@]}"; do
  echo "--------------------------------------"
  echo "Building Docker image for $service..."
  docker build -t "$service:latest" "$BACKEND_PATH/$service"

  echo "Loading $service image into Kind cluster $CLUSTER_NAME..."
  kind load docker-image "$service:latest" --name "$CLUSTER_NAME"
done

# -------------------------------
# Step 3: Deploy microservices via Helmfile
# -------------------------------
echo "--------------------------------------"
echo "Deploying all services via Helmfile..."
helmfile -f "$HELMFILE_PATH" apply

echo "--------------------------------------"
echo "✅ All infrastructure and services deployed successfully!"






