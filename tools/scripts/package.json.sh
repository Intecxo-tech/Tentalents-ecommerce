#!/bin/bash
set -euo pipefail

# Root directories
SERVICES_DIR="apps/backend"
LIBS_DIR="libs/shared"

# Node version for Docker / install notes
NODE_VERSION="${NODE_VERSION:-20}"

# Basic scripts template
scripts='{
  "start": "ts-node src/main.ts",
  "dev": "ts-node-dev src/main.ts",
  "build": "tsc",
  "lint": "eslint . --ext .ts"
}'

# Dev dependencies common to all services
dev_deps='{
  "typescript": "^5.4.5",
  "ts-node": "^10.9.2",
  "ts-node-dev": "^2.0.0",
  "@types/node": "^20.5.1",
  "@types/express": "^4.17.21",
  "eslint": "^9.32.0",
  "prettier": "^3.0.0"
}'

# Loop through each service folder
for service_path in "$SERVICES_DIR"/*; do
  if [ -d "$service_path" ]; then
    service_name=$(basename "$service_path")
    echo "Generating package.json for $service_name..."

    deps_lines=()

    # Add shared libraries
    for lib_path in "$LIBS_DIR"/*; do
      if [ -d "$lib_path" ]; then
        lib_name=$(basename "$lib_path")
        deps_lines+=("\"@shared/$lib_name\": \"file:../../../libs/shared/$lib_name\"")
      fi
    done

    # Add the service itself
    deps_lines+=("\"$service_name\": \"file:./\"")

    # Join dependencies
    deps_json=$(printf ",\n    %s" "${deps_lines[@]}")
    deps_json=${deps_json:2}  # remove leading comma

    # Build final package.json
    JSON="{\n  \"name\": \"$service_name\",\n  \"version\": \"1.0.0\",\n  \"main\": \"dist/main.js\",\n  \"scripts\": $scripts,\n  \"dependencies\": {\n    $deps_json\n  },\n  \"devDependencies\": $dev_deps\n}"

    # Write to service folder
    echo -e "$JSON" > "$service_path/package.json"
  fi
done

echo "✅ All package.json files generated successfully!"
