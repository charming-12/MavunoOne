#!/bin/bash
# Seed MavunoOne Production Database via API
# Usage: bash scripts/seed-api.sh <production-url>
# Example: bash scripts/seed-api.sh https://mavunoone.com

PROD_URL=${1:-"https://mavunoone.com"}

echo "🌱 Seeding MavunoOne Database..."
echo "Target: $PROD_URL/api/seed"
echo ""

RESPONSE=$(curl -X POST \
  -H "Content-Type: application/json" \
  -s \
  "$PROD_URL/api/seed")

echo "$RESPONSE" | grep -q "success" && SUCCESS=true || SUCCESS=false

if [ "$SUCCESS" = true ]; then
  echo "✅ Database seeded successfully!"
  echo ""
  echo "📝 Test Credentials:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "👤 Admin:"
  echo "   Email: admin@mavunoone.co.tz"
  echo "   Password: Admin@Mavuno2026!"
  echo ""
  echo "👔 Boss:"
  echo "   Email: boss@mavunoone.co.tz"
  echo "   Password: Boss@Mavuno2026!"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
  echo "❌ Seeding failed!"
  echo "$RESPONSE"
fi
