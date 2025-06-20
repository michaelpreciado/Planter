#!/bin/bash

# Deployment Fix Script
# Clears cache and rebuilds for clean deployment

echo "🔧 Fixing deployment issues..."

# Clear all cache
echo "🧹 Clearing build cache..."
rm -rf .next
rm -rf out
rm -rf node_modules/.cache
rm -rf .netlify

# Clear npm cache
echo "🧹 Clearing npm cache..."
npm cache clean --force

# Reinstall dependencies
echo "📦 Reinstalling dependencies..."
rm -rf node_modules
npm ci

# Verify TypeScript
echo "🔍 Checking TypeScript..."
npx tsc --noEmit

# Run build
echo "🏗️ Building for production..."
npm run build

echo "✅ Deployment fix complete!"
echo ""
echo "🚀 Ready to deploy to Netlify:"
echo "   1. Push changes to GitHub: git push origin main"
echo "   2. Or trigger manual deploy in Netlify dashboard"
echo "   3. Clear Netlify build cache if issues persist" 