#!/bin/bash
set -euo pipefail

# -------------------------------
# GitHub CLI script to set all secrets from a .env file
# -------------------------------

# Replace with your GitHub repository in owner/repo format
REPO="adhavswapna/tentalents-ecommerce"

# Path to your .env file
ENV_FILE=".env"

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null
then
    echo "GitHub CLI (gh) could not be found. Install it first."
    exit 1
fi

# Convert .env to Unix line endings (remove CR if present)
if command -v dos2unix &> /dev/null; then
    dos2unix "$ENV_FILE" > /dev/null 2>&1 || true
else
    # Fallback: remove carriage returns manually
    sed -i 's/\r$//' "$ENV_FILE"
fi

# Read each line in the .env file
while IFS='=' read -r key value || [ -n "$key" ]; do
    # Strip any carriage return characters
    key=$(echo "$key" | tr -d '\r')
    value=$(echo "$value" | tr -d '\r')

    # Skip empty lines or lines starting with #
    if [[ -z "$key" ]] || [[ "$key" =~ ^# ]]; then
        continue
    fi

    # Remove surrounding quotes if any
    value=$(echo "$value" | sed -E 's/^"(.*)"$/\1/' | sed -E "s/^'(.*)'$/\1/")

    # Set GitHub secret
    echo "Setting secret: $key"
    gh secret set "$key" --repo "$REPO" --body "$value"
done < "$ENV_FILE"

echo "✅ All secrets from $ENV_FILE have been set in $REPO"
