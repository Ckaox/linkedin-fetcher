#!/bin/bash

# Load token from .env
source .env

echo "🧪 Testing LinkedIn Fetcher API locally..."
echo ""

# Test 1: Health check
echo "📌 Test 1: Health check"
curl -s http://localhost:3000/health | jq '.'
echo ""

# Test 2: Check new posts
echo "📌 Test 2: Check for new posts"
curl -s -H "x-apify-token: $APIFY_API_TOKEN" \
  "http://localhost:3000/api/check-new-posts?username=gabrielmartinezes" | jq '.'
echo ""

# Test 3: Fetch posts
echo "📌 Test 3: Fetch posts"
curl -s -H "x-apify-token: $APIFY_API_TOKEN" \
  "http://localhost:3000/api/posts?username=gabrielmartinezes&max_posts=5" | jq '.'
echo ""

echo "✅ Tests completed!"
