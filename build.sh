#!/bin/bash
# Production build script for Docker deployment

echo "🚀 Starting production build for Hempire Enterprise..."

# Set environment variables
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1
export NODE_OPTIONS="--max-old-space-size=4096"

# Print system information
echo "📊 System Information:"
echo "• Node Version: $(node -v)"
echo "• NPM Version: $(npm -v)"
echo "• Memory Limit: 4GB"
echo "• Working Directory: $(pwd)"

# Clean build directories
echo "🧹 Cleaning previous build artifacts..."
rm -rf .next

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm ci
else
  echo "✅ Dependencies already installed"
fi

# Run build
echo "🔨 Building Next.js application..."
npm run build:next

# Check build result
if [ $? -eq 0 ]; then
  echo "✅ Build completed successfully"
  
  # Verify standalone output
  if [ -d ".next/standalone" ]; then
    echo "✅ Standalone output directory verified"
  else
    echo "⚠️  Warning: Standalone output not found"
  fi
else
  echo "❌ Build failed"
  exit 1
fi

echo "🎉 Build process complete! Your app is ready for deployment."
exit 0
