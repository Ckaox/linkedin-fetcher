#!/bin/bash

# Script para probar el endpoint de actualización de métricas
# Uso: ./test-update-metrics.sh

echo "🧪 Testing Update Metrics Endpoint"
echo "=================================="
echo ""

# Configuración
SERVER_URL="${SERVER_URL:-http://localhost:3000}"
APIFY_TOKEN="${APIFY_TOKEN:-your-token-here}"
USERNAME="${USERNAME:-gabrielmartinezes}"

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📍 Server: $SERVER_URL${NC}"
echo -e "${BLUE}👤 Username: $USERNAME${NC}"
echo ""

# Test 1: Health check
echo -e "${YELLOW}1️⃣ Testing health endpoint...${NC}"
curl -s "$SERVER_URL/health" | jq '.'
echo ""
echo ""

# Test 2: Get initial posts
echo -e "${YELLOW}2️⃣ Fetching initial posts...${NC}"
POSTS_RESPONSE=$(curl -s -H "x-apify-token: $APIFY_TOKEN" \
  "$SERVER_URL/api/posts?username=$USERNAME&max_posts=3")

echo "$POSTS_RESPONSE" | jq '.'
echo ""

# Extract post IDs and metrics
POST_1_ID=$(echo "$POSTS_RESPONSE" | jq -r '.data.posts[0].id')
POST_1_LIKES=$(echo "$POSTS_RESPONSE" | jq -r '.data.posts[0].metrics.likes')
POST_1_COMMENTS=$(echo "$POSTS_RESPONSE" | jq -r '.data.posts[0].metrics.comments')
POST_1_REPOSTS=$(echo "$POSTS_RESPONSE" | jq -r '.data.posts[0].metrics.reposts')

POST_2_ID=$(echo "$POSTS_RESPONSE" | jq -r '.data.posts[1].id')
POST_2_LIKES=$(echo "$POSTS_RESPONSE" | jq -r '.data.posts[1].metrics.likes')
POST_2_COMMENTS=$(echo "$POSTS_RESPONSE" | jq -r '.data.posts[1].metrics.comments')
POST_2_REPOSTS=$(echo "$POSTS_RESPONSE" | jq -r '.data.posts[1].metrics.reposts')

echo -e "${GREEN}✅ Got posts:${NC}"
echo "   Post 1: $POST_1_ID"
echo "     Likes: $POST_1_LIKES, Comments: $POST_1_COMMENTS, Reposts: $POST_1_REPOSTS"
echo "   Post 2: $POST_2_ID"
echo "     Likes: $POST_2_LIKES, Comments: $POST_2_COMMENTS, Reposts: $POST_2_REPOSTS"
echo ""
echo ""

# Test 3: Update metrics with SAME values (should return no changes)
echo -e "${YELLOW}3️⃣ Testing update with SAME metrics (should skip Apify)...${NC}"
UPDATE_PAYLOAD=$(cat <<EOF
{
  "username": "$USERNAME",
  "posts": [
    {
      "id": "$POST_1_ID",
      "likes": $POST_1_LIKES,
      "comments": $POST_1_COMMENTS,
      "reposts": $POST_1_REPOSTS
    },
    {
      "id": "$POST_2_ID",
      "likes": $POST_2_LIKES,
      "comments": $POST_2_COMMENTS,
      "reposts": $POST_2_REPOSTS
    }
  ]
}
EOF
)

echo "Request payload:"
echo "$UPDATE_PAYLOAD" | jq '.'
echo ""

UPDATE_RESPONSE=$(curl -s -X POST \
  -H "x-apify-token: $APIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$UPDATE_PAYLOAD" \
  "$SERVER_URL/api/posts/update-metrics")

echo "Response:"
echo "$UPDATE_RESPONSE" | jq '.'
echo ""

CHANGED_COUNT=$(echo "$UPDATE_RESPONSE" | jq -r '.data.comparison.changed | length')
if [ "$CHANGED_COUNT" -eq 0 ]; then
  echo -e "${GREEN}✅ PASS: No changes detected (as expected)${NC}"
else
  echo -e "${YELLOW}⚠️  WARNING: Changes detected (unexpected, maybe metrics changed)${NC}"
fi
echo ""
echo ""

# Test 4: Update metrics with DIFFERENT values (simulating Clay scenario)
echo -e "${YELLOW}4️⃣ Testing update with DIFFERENT metrics (simulating growth)...${NC}"

# Simulate metrics from Clay that are outdated
OLD_LIKES=$((POST_1_LIKES - 10))
OLD_COMMENTS=$((POST_1_COMMENTS - 2))

UPDATE_PAYLOAD_2=$(cat <<EOF
{
  "username": "$USERNAME",
  "posts": [
    {
      "id": "$POST_1_ID",
      "likes": $OLD_LIKES,
      "comments": $OLD_COMMENTS,
      "reposts": $POST_1_REPOSTS
    }
  ]
}
EOF
)

echo "Request payload (with outdated metrics):"
echo "$UPDATE_PAYLOAD_2" | jq '.'
echo ""

UPDATE_RESPONSE_2=$(curl -s -X POST \
  -H "x-apify-token: $APIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$UPDATE_PAYLOAD_2" \
  "$SERVER_URL/api/posts/update-metrics")

echo "Response:"
echo "$UPDATE_RESPONSE_2" | jq '.'
echo ""

CHANGED_COUNT_2=$(echo "$UPDATE_RESPONSE_2" | jq -r '.data.comparison.changed | length')
if [ "$CHANGED_COUNT_2" -gt 0 ]; then
  echo -e "${GREEN}✅ PASS: Changes detected and metrics updated${NC}"
  
  # Show what changed
  echo ""
  echo "Changes detected:"
  echo "$UPDATE_RESPONSE_2" | jq -r '.data.comparison.details[]'
else
  echo -e "${YELLOW}⚠️  No changes detected${NC}"
fi
echo ""
echo ""

# Test 5: Error handling - missing token
echo -e "${YELLOW}5️⃣ Testing error handling (missing token)...${NC}"
ERROR_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "posts": []}' \
  "$SERVER_URL/api/posts/update-metrics")

echo "$ERROR_RESPONSE" | jq '.'
echo ""

HAS_ERROR=$(echo "$ERROR_RESPONSE" | jq -r '.success')
if [ "$HAS_ERROR" = "false" ]; then
  echo -e "${GREEN}✅ PASS: Error handled correctly${NC}"
else
  echo -e "${YELLOW}⚠️  FAIL: Should have returned error${NC}"
fi
echo ""
echo ""

# Summary
echo "=================================="
echo -e "${GREEN}🎉 Tests completed!${NC}"
echo "=================================="
echo ""
echo "💡 How to use in Clay:"
echo "   1. Store current metrics (likes, comments, reposts) in table"
echo "   2. Run daily: POST /api/posts/update-metrics with those values"
echo "   3. API will compare with real-time data"
echo "   4. If changed, returns updated metrics (costs ~\$0.10)"
echo "   5. If unchanged, returns empty (costs \$0)"
echo "   6. Update your Clay table with new metrics"
echo "   7. Fetch new interactions only for posts with changes"
echo ""
