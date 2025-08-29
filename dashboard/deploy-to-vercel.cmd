@echo off
echo.
echo =========================================
echo 🚀 Deploying Nail Salon Dashboard to Vercel
echo =========================================
echo.

echo Step 1: Logging into Vercel...
echo Please choose "Continue with GitHub" when prompted
echo.
npx vercel login

echo.
echo Step 2: Deploying to production...
echo.
npx vercel --prod --yes

echo.
echo =========================================
echo ✅ Deployment Complete!
echo =========================================
echo.
echo Next steps:
echo 1. Go to your Vercel dashboard
echo 2. Add the environment variables from VERCEL_DEPLOYMENT_GUIDE.md
echo 3. Test your live application!
echo.
pause