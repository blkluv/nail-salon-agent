@echo off
REM Dashboard Deployment Script for Vercel (Windows)
REM This script prepares and deploys the dashboard to Vercel

echo.
echo 🚀 DASHBOARD DEPLOYMENT TO VERCEL
echo =================================
echo.

REM Navigate to dashboard directory
cd dashboard

REM Check if .env.local exists
if not exist .env.local (
    echo 📝 Creating .env.local file...
    (
        echo NEXT_PUBLIC_SUPABASE_URL=https://irvyhhkoiyzartmmvbxw.supabase.co
        echo NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMTgyOTMsImV4cCI6MjA3MDY5NDI5M30.EArkK7byT7CZkQVL1B905qDwlCyq8TQenRZnkTl-5Ms
        echo NEXT_PUBLIC_API_URL=https://vapi-nail-salon-agent-production.up.railway.app
    ) > .env.local
    echo ✅ .env.local created
) else (
    echo ✅ .env.local already exists
)

echo.
echo 📦 Installing dependencies...
call npm install

echo.
echo 🔨 Building dashboard...
call npm run build

if %errorlevel% equ 0 (
    echo.
    echo ✅ Build successful!
    echo.
    echo 📤 Ready to deploy to Vercel
    echo.
    echo Next steps:
    echo 1. Install Vercel CLI if not already: npm i -g vercel
    echo 2. Run: vercel --prod
    echo 3. Follow the prompts to complete deployment
    echo.
    echo The dashboard will be available at your Vercel URL
) else (
    echo.
    echo ❌ Build failed. Please fix errors before deploying.
    exit /b 1
)