stages:
  - lint-test
  - build
  - scan
  - deploy
  - rollback

variables:
  GHCR_REGISTRY: ghcr.io
  GHCR_OWNER: your-github-username   # CHANGE THIS
  GHCR_REPO: your-repo-name           # CHANGE THIS
  KUBE_NAMESPACE: backend
  HELM_RELEASE_NAME: backend-app
  HELM_CHART_PATH: ./charts/backend
  KUBECONFIG: $CI_PROJECT_DIR/.kube/config
  TRIVY_CACHE_DIR: "$CI_PROJECT_DIR/.cache/trivy"
  NX_CACHE_FOLDER: "$CI_PROJECT_DIR/.nx-cache"

default:
  image: docker:20.10.16
  services:
    - docker:dind

  before_script:
    - apk add --no-cache bash curl git openssh-client helm kubectl jq

lint_test:
  stage: lint-test
  image: node:18
  script:
    - npm ci
    - npx nx lint
    - npx nx test --code-coverage --ci
  cache:
    key: "$CI_COMMIT_REF_SLUG-npm"
    paths:
      - node_modules/
      - .nx-cache/

build_images:
  stage: build
  image: docker:20.10.16
  services:
    - docker:dind
  script:
    # Login to GHCR
    - echo "$GHCR_PAT" | docker login $GHCR_REGISTRY -u $GHCR_OWNER --password-stdin

    # Build and push images per microservice
    - |
      for service in user-service product-service order-service rating-service email-service payment-service search-service cart-service admin-service invoice-service analytics-service vendor-service; do
        IMAGE_TAG=$GHCR_REGISTRY/$GHCR_OWNER/$GHCR_REPO/$service:$CI_COMMIT_SHA
        echo "Building and pushing $service image: $IMAGE_TAG"
        docker build -t $IMAGE_TAG ./apps/$service
        docker push $IMAGE_TAG
      done
  only:
    - main
  cache:
    key: "$CI_COMMIT_REF_SLUG-docker"
    paths:
      - /var/lib/docker

security_scan:
  stage: scan
  image:
    name: aquasec/trivy:latest
    entrypoint: [""]
  script:
    - mkdir -p $TRIVY_CACHE_DIR
    - |
      for service in user-service product-service order-service rating-service email-service payment-service search-service cart-service admin-service invoice-service analytics-service vendor-service; do
        IMAGE=$GHCR_REGISTRY/$GHCR_OWNER/$GHCR_REPO/$service:$CI_COMMIT_SHA
        echo "Scanning image $IMAGE"
        trivy image --cache-dir $TRIVY_CACHE_DIR --exit-code 1 --severity HIGH,CRITICAL $IMAGE
      done
  dependencies:
    - build_images
  only:
    - main
  allow_failure: false

deploy:
  stage: deploy
  image:
    name: lachlanevenson/k8s-helm:latest
    entrypoint: [""]
  script:
    - mkdir -p ~/.kube
    - echo "$KUBE_CONFIG_DATA" | base64 -d > $KUBECONFIG

    # Ensure namespace exists
    - kubectl get ns $KUBE_NAMESPACE || kubectl create ns $KUBE_NAMESPACE

    # Deploy helm chart with correct image tags per service
    - |
      # Create helm --set image.tag values for all microservices
      SET_IMAGE_TAGS=""
      for service in user-service product-service order-service rating-service email-service payment-service search-service cart-service admin-service invoice-service analytics-service vendor-service; do
        SET_IMAGE_TAGS="$SET_IMAGE_TAGS --set images.$service.tag=$CI_COMMIT_SHA"
      done

      helm upgrade --install $HELM_RELEASE_NAME $HELM_CHART_PATH \
        --namespace $KUBE_NAMESPACE \
        $SET_IMAGE_TAGS \
        --atomic \
        --wait

  only:
    - main
  environment:
    name: staging
    url: http://your-staging-url

rollback:
  stage: rollback
  image:
    name: lachlanevenson/k8s-helm:latest
    entrypoint: [""]
  script:
    - mkdir -p ~/.kube
    - echo "$KUBE_CONFIG_DATA" | base64 -d > $KUBECONFIG
    - echo "Rolling back Helm release $HELM_RELEASE_NAME"
    - helm rollback $HELM_RELEASE_NAME -n $KUBE_NAMESPACE 1
  when: manual
  only:
    - main


# GitLab CI/CD Pipeline Overview
# This GitLab CI/CD pipeline automates the full lifecycle of your backend microservices project:

# Linting and Testing: Uses Nx and Jest to ensure code quality and correctness before building.

# Docker Image Build & Push: Builds Docker images for each microservice and pushes them securely to GitHub Container Registry (GHCR).

# Security Scanning: Runs Trivy vulnerability scans on the built images to ensure container security.

# Helm-based Kubernetes Deployment: Deploys all microservices to Kubernetes (local Kind or remote cluster) using Helm charts, with dynamic image tagging.

# Rollback Capability: Supports manual rollback via Helm to revert to a previous stable release if deployment issues arise.

