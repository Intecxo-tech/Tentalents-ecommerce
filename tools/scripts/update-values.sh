#!/bin/bash
set -e

# Base path to Helm charts
BASE_HELM_PATH="./infra/helm/microservices"
ENV_FILE=".env"

# Function to read .env values safely
get_env() {
  grep -E "^$1=" "$ENV_FILE" | cut -d '=' -f2- | sed 's/^"//;s/"$//'
}

# List of services and their NodePorts
declare -A services_ports=(
  ["admin-service"]=$(get_env "ADMIN_SERVICE_PORT")
  ["vendor-service"]=$(get_env "VENDOR_SERVICE_PORT")
  ["invoice-service"]=$(get_env "INVOICE_SERVICE_PORT")
  ["user-service"]=$(get_env "USER_SERVICE_PORT")
  ["product-service"]=$(get_env "PRODUCT_SERVICE_PORT")
  ["order-service"]=$(get_env "ORDER_SERVICE_PORT")
  ["rating-service"]=$(get_env "RATING_SERVICE_PORT")
  ["email-service"]=$(get_env "EMAIL_SERVICE_PORT")
  ["payment-service"]=$(get_env "PAYMENT_SERVICE_PORT")
  ["search-service"]=$(get_env "SEARCH_SERVICE_PORT")
  ["cart-service"]=$(get_env "CART_SERVICE_PORT")
  ["analytics-service"]=$(get_env "ANALYTICS_SERVICE_PORT")
)

# Loop through services
for service in "${!services_ports[@]}"; do
  SERVICE_DIR="$BASE_HELM_PATH/$service"
  mkdir -p "$SERVICE_DIR"

  # 1️⃣ Generate values.yaml
  VALUES_FILE="$SERVICE_DIR/values.yaml"
  echo "Generating $VALUES_FILE..."
  cat > "$VALUES_FILE" <<EOF
replicaCount: 1

image:
  repository: $service
  pullPolicy: IfNotPresent
  tag: latest

service:
  type: NodePort
  port: ${services_ports[$service]}
  nodePort: ${services_ports[$service]}

ingress:
  enabled: true
  className: 'nginx'
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /\$1
    nginx.ingress.kubernetes.io/use-regex: "true"
  hosts:
    - host: api.localhost
      paths:
        - path: /api/$service/(.*)
          pathType: ImplementationSpecific

resources:
  limits:
    cpu: "500m"
    memory: "512Mi"
  requests:
    cpu: "250m"
    memory: "256Mi"

# Non-sensitive config
env:
  - name: REDIS_HOST
    value: "$(get_env REDIS_HOST)"
  - name: REDIS_PORT
    value: "$(get_env REDIS_PORT)"
  - name: MINIO_ENDPOINT
    value: "$(get_env MINIO_ENDPOINT)"
  - name: MINIO_PORT
    value: "$(get_env MINIO_PORT)"
  - name: KAFKA_BROKERS
    value: "$(get_env KAFKA_BROKERS)"

# Sensitive data from Kubernetes Secret
envFrom:
  - secretRef:
      name: $service-secrets
EOF

  # 2️⃣ Generate secrets.yaml
  SECRETS_FILE="$SERVICE_DIR/secrets.yaml"
  echo "Generating $SECRETS_FILE..."
  cat > "$SECRETS_FILE" <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: $service-secrets
type: Opaque
stringData:
  DATABASE_URL: "$(get_env DATABASE_URL)"
  JWT_SECRET: "$(get_env JWT_SECRET)"
  MINIO_ACCESS_KEY: "$(get_env MINIO_ACCESS_KEY)"
  MINIO_SECRET_KEY: "$(get_env MINIO_SECRET_KEY)"
  STRIPE_PAYMENT_SECRET_KEY: "$(get_env STRIPE_PAYMENT_SECRET_KEY)"
  STRIPE_WEBHOOK_SECRET: "$(get_env STRIPE_WEBHOOK_SECRET)"
EOF

  # 3️⃣ Generate configmap.yaml
  CONFIGMAP_FILE="$SERVICE_DIR/configmap.yaml"
  echo "Generating $CONFIGMAP_FILE..."
  cat > "$CONFIGMAP_FILE" <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: $service-config
data:
  REDIS_HOST: "$(get_env REDIS_HOST)"
  REDIS_PORT: "$(get_env REDIS_PORT)"
  MINIO_ENDPOINT: "$(get_env MINIO_ENDPOINT)"
  MINIO_PORT: "$(get_env MINIO_PORT)"
  KAFKA_BROKERS: "$(get_env KAFKA_BROKERS)"
EOF

  # 4️⃣ Generate ingress.yaml
  INGRESS_FILE="$SERVICE_DIR/ingress.yaml"
  echo "Generating $INGRESS_FILE..."
  cat > "$INGRESS_FILE" <<EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: $service-ingress
  annotations:
    kubernetes.io/ingress.class: "nginx"
    nginx.ingress.kubernetes.io/rewrite-target: /\$1
    nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  rules:
    - host: api.localhost
      http:
        paths:
          - path: /api/$service/(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: $service
                port:
                  number: ${services_ports[$service]}
EOF

done

echo "✅ All values.yaml, secrets.yaml, configmap.yaml, and ingress.yaml files generated from $ENV_FILE!"
