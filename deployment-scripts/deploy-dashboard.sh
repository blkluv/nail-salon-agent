#!/bin/bash

# Dashboard Deployment Script for Vercel
# This script prepares and deploys the dashboard to Vercel

echo "🚀 DASHBOARD DEPLOYMENT TO VERCEL"
echo "================================="
echo ""

# Navigate to dashboard directory
cd dashboard

# Check if .env.local exists, if not create it
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOL
NEXT_PUBLIC_SUPABASE_URL=https://irvyhhkoiyzartmmvbxw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMTgyOTMsImV4cCI6MjA3MDY5NDI5M30.EArkK7byT7CZkQVL1B905qDwlCyq8TQenRZnkTl-5Ms
NEXT_PUBLIC_API_URL=https://vapi-nail-salon-agent-production.up.railway.app
EOL
    echo "✅ .env.local created"
else
    echo "✅ .env.local already exists"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Run build to check for errors
echo ""
echo "🔨 Building dashboard..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📤 Deploying to Vercel..."
    echo ""
    echo "Run: vercel --prod"
    echo ""
    echo "Or if you haven't installed Vercel CLI:"
    echo "npm i -g vercel"
    echo "vercel --prod"
else
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi