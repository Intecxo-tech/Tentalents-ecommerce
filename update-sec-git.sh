#!/bin/bash
# Usage: ./update-github-secrets.sh your-org/your-repo

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 owner/repo"
  exit 1
fi

REPO="$1"
ENV_FILE=".env"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE not found!"
  exit 1
fi

# Read .env line by line
while IFS= read -r line || [[ -n "$line" ]]; do
  # Skip empty lines and comments
  if [[ -z "$line" || "$line" =~ ^# ]]; then
    continue
  fi

  # Extract key=value, ignoring export if present
  if [[ "$line" =~ ^(export[[:space:]]+)?([^=]+)=(.*)$ ]]; then
    KEY="${BASH_REMATCH[2]}"
    VALUE="${BASH_REMATCH[3]}"
    # Remove surrounding quotes if any
    VALUE="${VALUE%\"}"
    VALUE="${VALUE#\"}"
    VALUE="${VALUE%\'}"
    VALUE="${VALUE#\'}"

    # Update GitHub secret
    echo "Updating secret: $KEY"
    gh secret set "$KEY" --repo "$REPO" -b "$VALUE"
  fi
done < "$ENV_FILE"

echo "All secrets updated."
