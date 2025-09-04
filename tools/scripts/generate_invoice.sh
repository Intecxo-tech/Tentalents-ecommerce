#!/bin/bash

# -------------------------------
# Configuration
# -------------------------------
INVOICE_ID="6586f8d9-b967-449c-ad6c-24ecd7723140"
BASE_URL="http://localhost:3009/api/invoices"

# Replace this with your JWT token
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3NjE1MWYwZS04NDgzLTQ1ZTEtYmUxYi1hNjE4NjgyMDI0OWQiLCJlbWFpbCI6ImR5QGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU2OTc0NDM5LCJleHAiOjE3NTcxNTQ0Mzl9.1shbEnBouH8iQ59PNkBdUV8pNaDTmZbCXIiAZdE"

# -------------------------------
# Make API call
# -------------------------------
curl -X POST "$BASE_URL/$INVOICE_ID" \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json"
