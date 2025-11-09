#!/bin/bash

# BRUH - Quick Start Setup Script
# This script automates the initial setup process

set -e

echo "🚀 BRUH - Anonymous Feedback System Setup"
echo "=========================================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm@8
fi

echo "✅ Prerequisites met"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install
echo "✅ Dependencies installed"
echo ""

# Generate rate limit salt
echo "🔐 Generating security secrets..."
if ! grep -q "RATE_LIMIT_SALT=" .env 2>/dev/null; then
    SALT=$(openssl rand -base64 32)
    echo "Generated RATE_LIMIT_SALT"
else
    echo "RATE_LIMIT_SALT already exists in .env"
fi
echo ""

# Build packages
echo "🔨 Building packages..."
pnpm --filter @bruh/crypto build
pnpm --filter @bruh/db build
pnpm --filter @bruh/ui build
echo "✅ Packages built"
echo ""

# Check .env file
if [ ! -f .env ]; then
    echo "⚠️  .env file not found"
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your credentials before running the app!"
    echo ""
    echo "Required credentials:"
    echo "  - Supabase URL and keys"
    echo "  - Instagram OAuth credentials"
    echo "  - Paytm credentials (for UPI payments)"
    echo "  - FCM server key"
    echo ""
else
    echo "✅ .env file exists"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit .env with your credentials"
echo "  2. Set up Supabase:"
echo "     npx supabase init"
echo "     npx supabase db push"
echo "     npx supabase functions deploy sendMessage"
echo "     npx supabase functions deploy upiWebhook"
echo "     npx supabase functions deploy upiWebhook"
echo "     npx supabase functions deploy moderationWorker"
echo "  3. Run development server:"
echo "     pnpm dev"
echo ""
echo "For detailed instructions, see README.md"
