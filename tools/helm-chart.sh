#!/bin/bash

set -e

services=(
  user-service
  product-service
  order-service
  rating-service
  email-service
  payment-service
  search-service
  cart-service
  admin-service
  invoice-service
  analytics-service
  vendor-service
)

declare -A service_ports=(
  [user-service]=3012
  [product-service]=3001
  [order-service]=3002
  [rating-service]=3003
  [email-service]=3004
  [payment-service]=3005
  [search-service]=3006
  [cart-service]=3007
  [admin-service]=3008
  [invoice-service]=3009
  [analytics-service]=3010
  [vendor-service]=3011
)

mkdir -p charts

for svc in "${services[@]}"; do
  echo "Creating chart: $svc"
  helm create charts/$svc
  rm -rf charts/$svc/templates/tests

  port=${service_ports[$svc]}

  # deployment.yaml
  cat > charts/$svc/templates/deployment.yaml <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Chart.Name }}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: {{ .Chart.Name }}
  template:
    metadata:
      labels:
        app: {{ .Chart.Name }}
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default \$.Values.global.imageTag }}"
          ports:
            - containerPort: {{ .Values.service.port }}
          envFrom:
            - configMapRef:
                name: {{ include "fullname" . }}-configmap
            - secretRef:
                name: {{ include "fullname" . }}-secret
EOF

  # service.yaml
  cat > charts/$svc/templates/service.yaml <<EOF
apiVersion: v1
kind: Service
metadata:
  name: {{ .Chart.Name }}
spec:
  type: ClusterIP
  selector:
    app: {{ .Chart.Name }}
  ports:
    - port: {{ .Values.service.port }}
      targetPort: {{ .Values.service.port }}
EOF

  # ingress.yaml
  cat > charts/$svc/templates/ingress.yaml <<EOF
{{- if .Values.ingress.enabled }}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ include "fullname" . }}-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
    - host: {{ .Values.ingress.host }}
      http:
        paths:
          - path: {{ .Values.ingress.path | default "/" }}
            pathType: Prefix
            backend:
              service:
                name: {{ .Chart.Name }}
                port:
                  number: {{ .Values.service.port }}
{{- end }}
EOF

  # hpa.yaml
  cat > charts/$svc/templates/hpa.yaml <<EOF
{{- if .Values.autoscaling.enabled }}
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {{ include "fullname" . }}-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {{ .Chart.Name }}
  minReplicas: {{ .Values.autoscaling.minReplicas }}
  maxReplicas: {{ .Values.autoscaling.maxReplicas }}
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: {{ .Values.autoscaling.targetCPUUtilizationPercentage }}
{{- end }}
EOF

  # configmap.yaml
  cat > charts/$svc/templates/configmap.yaml <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ include "fullname" . }}-configmap
data:
{{- range \$key, \$value := .Values.config }}
  {{ \$key }}: "{{ \$value }}"
{{- end }}
EOF

  # secret.yaml
  cat > charts/$svc/templates/secret.yaml <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: {{ include "fullname" . }}-secret
type: Opaque
data:
{{- range \$key, \$value := .Values.secrets }}
  {{ \$key }}: {{ \$value | b64enc }}
{{- end }}
EOF

  # values.yaml
  cat > charts/$svc/values.yaml <<EOF
image:
  repository: $svc
  tag: latest

service:
  port: $port

ingress:
  enabled: true
  host: $svc.localhost
  path: /

autoscaling:
  enabled: true
  minReplicas: 1
  maxReplicas: 3
  targetCPUUtilizationPercentage: 75

config:
  REDIS_URL: redis://redis:6379
  POSTGRES_URL: postgres://user:password@postgres:5432/db

secrets:
  DB_PASSWORD: my-db-password
  JWT_SECRET: my-jwt-secret
EOF

  echo "Chart $svc created and templates added with port $port."
done

echo "All subcharts scaffolded successfully!"
