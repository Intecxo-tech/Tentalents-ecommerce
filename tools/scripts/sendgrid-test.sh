#!/bin/bash

# Load environment variables from .env.sendgrid
export $(grep -v '^#' .env.sendgrid | xargs)

# Test recipient
TEST_RECIPIENT="swapnaadhav123@gmail.com"

# Send email via SendGrid API
curl -s -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer $SMTP_PASS" \
  -H "Content-Type: application/json" \
  -d '{
    "personalizations": [{"to":[{"email":"'"$TEST_RECIPIENT"'"}],"subject":"✅ SendGrid API Test Email"}],
    "from": {"email":"'"$EMAIL_FROM"'"},
    "content":[{"type":"text/html","value":"<h1 style=\"color:#4CAF50;\">SendGrid API Test ✅</h1><p>This is a <strong>test email</strong> sent via <em>SendGrid API</em>.</p><p style=\"color:#888;\">Have a nice day! 🌟</p>"}]
  }'
