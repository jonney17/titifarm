#!/bin/bash

echo "🚀 Deploying TitiFarm to Vercel with MoMo Payment..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "Checking Vercel authentication..."
vercel whoami || vercel login

# Set production environment variables
echo "Setting up environment variables..."

# Database
vercel env add DATABASE_URL production

# NextAuth
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production

# MoMo Production Settings
echo "Setting MoMo production environment variables..."
echo "📝 Bạn cần cung cấp thông tin MoMo production:"

read -p "MOMO_PARTNER_CODE (production): " MOMO_PARTNER_CODE
echo "$MOMO_PARTNER_CODE" | vercel env add MOMO_PARTNER_CODE production

read -p "MOMO_ACCESS_KEY (production): " MOMO_ACCESS_KEY  
echo "$MOMO_ACCESS_KEY" | vercel env add MOMO_ACCESS_KEY production

read -s -p "MOMO_SECRET_KEY (production): " MOMO_SECRET_KEY
echo "$MOMO_SECRET_KEY" | vercel env add MOMO_SECRET_KEY production
echo

# Get domain for callback URLs
read -p "Your production domain (e.g., titifarm.vercel.app): " DOMAIN

if [ ! -z "$DOMAIN" ]; then
    echo "https://$DOMAIN/api/payment/momo/callback" | vercel env add MOMO_REDIRECT_URL production
    echo "https://$DOMAIN/api/payment/momo/ipn" | vercel env add MOMO_IPN_URL production
    echo "https://$DOMAIN" | vercel env add NEXTAUTH_URL production
fi

# Deploy
echo "🏗️  Building and deploying..."
vercel --prod

echo "✅ Deployment completed!"
echo "🔗 Don't forget to:"
echo "   1. Update MoMo merchant settings with your new callback URLs"
echo "   2. Test payment flow on production"
echo "   3. Monitor logs for any issues"
