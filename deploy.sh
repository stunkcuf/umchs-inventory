#!/bin/bash

set -e

echo "🚀 Deploying Inventory System to Fly.io..."
echo ""

# Check if fly CLI is installed
if ! command -v fly &> /dev/null; then
    echo "❌ Fly CLI not found. Please install it first:"
    echo "   brew install flyctl"
    echo "   OR visit: https://fly.io/docs/hands-on/install-flyctl/"
    exit 1
fi

# Check if logged in
echo "📋 Checking Fly.io authentication..."
if ! fly auth whoami &> /dev/null; then
    echo "❌ Not logged in to Fly.io. Please run:"
    echo "   fly auth login"
    exit 1
fi

echo "✅ Authenticated"
echo ""

# Check if volume exists
echo "💾 Checking for persistent volume..."
if fly volumes list --app umchs-inventory 2>/dev/null | grep -q "umchs_inventory_data"; then
    echo "✅ Volume already exists"
else
    echo "📦 Creating persistent volume..."
    fly volumes create umchs_inventory_data --size 1 --region ams --app umchs-inventory
    echo "✅ Volume created"
fi
echo ""

# Check if JWT_SECRET is set
echo "🔐 Checking JWT secret..."
if fly secrets list --app umchs-inventory 2>/dev/null | grep -q "JWT_SECRET"; then
    echo "✅ JWT_SECRET already set"
else
    echo "⚠️  JWT_SECRET not set. Generating secure secret..."
    JWT_SECRET=$(openssl rand -base64 32)
    fly secrets set JWT_SECRET="$JWT_SECRET" --app umchs-inventory
    echo "✅ JWT_SECRET configured"
fi
echo ""

# Deploy
echo "🚢 Deploying application..."
fly deploy --app umchs-inventory

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your API is live at: https://umchs-inventory.fly.dev/api"
echo ""
echo "🔍 Test it with:"
echo "   curl https://umchs-inventory.fly.dev/api/health"
echo ""
echo "👤 Default login:"
echo "   Username: admin"
echo "   Password: admin123"
echo "   ⚠️  CHANGE THIS IMMEDIATELY!"
echo ""
echo "📊 View logs:"
echo "   fly logs --app umchs-inventory"
echo ""
