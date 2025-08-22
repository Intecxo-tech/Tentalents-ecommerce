# GitLab CI/CD pipeline for Tentalents Monorepo
# Builds, scans, pushes Docker images for all backend services
# Deploys observability stack (Prometheus, Jaeger, Grafana)
# Deploys microservices via Helmfile

stages:
  - build
  - scan
  - push
  - observability
  - deploy

variables:
  # Base paths
  BACKEND_PATH: apps/backend
  K8S_INFRA_PATH: infra/k8s
  HELMFILE_PATH: helmfile.yaml

  # Docker & GitHub Container Registry info
  GHCR_REGISTRY: ghcr.io
  GHCR_NAMESPACE: adhavswapna

# ---------------------------
# Dynamically generate services list
# This detects all folders under apps/backend (each folder is a service)
# ---------------------------
before_script:
  - echo "Generating services list dynamically..."
  - |
    SERVICES=$(ls $BACKEND_PATH | grep -v '^$' | tr '\n' ' ')
    echo "Services found: $SERVICES"

# ---------------------------
# Build Docker images for each service
# ---------------------------
build_images:
  stage: build
  image: docker:24.0.5
  services:
    - docker:24.0.5-dind
  script:
    - |
      # Loop through each service folder and build its Docker image
      for service in $SERVICES; do
        echo "🔹 Building Docker image for service: $service"
        docker build -t "$GHCR_REGISTRY/$GHCR_NAMESPACE/$service:latest" "$BACKEND_PATH/$service"
      done
  tags:
    - docker

# ---------------------------
# Security scan with Trivy for all services
# ---------------------------
scan_images:
  stage: scan
  image: aquasec/trivy:latest
  script:
    - |
      # Loop through all services and run Trivy vulnerability scan
      for service in $SERVICES; do
        echo "🔍 Scanning Docker image for service: $service"
        trivy image "$GHCR_REGISTRY/$GHCR_NAMESPACE/$service:latest"
      done
  dependencies:
    - build_images

# ---------------------------
# Push Docker images to GitHub Container Registry
# ---------------------------
push_images:
  stage: push
  image: docker:24.0.5
  services:
    - docker:24.0.5-dind
  before_script:
    # Authenticate to GitHub Container Registry using PAT
    - echo "$GHCR_PAT" | docker login ghcr.io -u "$GHCR_USER" --password-stdin
  script:
    - |
      # Loop through services and push each image
      for service in $SERVICES; do
        echo "🚀 Pushing Docker image for service: $service"
        docker push "$GHCR_REGISTRY/$GHCR_NAMESPACE/$service:latest"
      done
  dependencies:
    - scan_images
  only:
    - main
  tags:
    - docker

# ---------------------------
# Deploy Observability stack: Prometheus, Jaeger, Grafana
# ---------------------------
deploy_observability:
  stage: observability
  image: lachlanevenson/k8s-helm:latest
  before_script:
    # Add Helm repos for observability tools
    - helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    - helm repo add jaegertracing https://jaegertracing.github.io/helm-charts
    - helm repo add grafana https://grafana.github.io/helm-charts
    - helm repo update
  script:
    # Deploy Prometheus, Jaeger, Grafana via Helm
    - helm upgrade --install prometheus prometheus-community/kube-prometheus-stack
    - helm upgrade --install jaeger jaegertracing/jaeger
    - helm upgrade --install grafana grafana/grafana
  environment:
    name: observability
  only:
    - main

# ---------------------------
# Deploy all microservices via Helmfile
# ---------------------------
deploy_services:
  stage: deploy
  image: lachlanevenson/k8s-helm:latest
  script:
    # Apply all Helmfile charts (services & infrastructure)
    - echo "Deploying all microservices via Helmfile..."
    - helmfile -f "$HELMFILE_PATH" apply
  dependencies:
    - push_images
  environment:
    name: production
  only:
    - main
