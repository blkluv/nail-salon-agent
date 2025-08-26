@echo off
echo 🔧 Deploying Express 4.x fix to Railway...
echo.

echo Linking to Railway project...
railway link -p charming-flow

echo.
echo Deploying to vapi-nail-salon-agent service...
railway up --service vapi-nail-salon-agent --detach

echo.
echo ✅ Deployment complete! Testing in 30 seconds...
timeout /t 30

echo.
echo 🧪 Testing health endpoint...
curl "https://vapi-nail-salon-agent-production.up.railway.app/health"

echo.
echo 🧪 Testing main endpoint...
curl "https://vapi-nail-salon-agent-production.up.railway.app/"

echo.
echo ✅ If you see JSON responses above, your server is working!
echo 📞 Voice AI should now be live at: (424) 351-9304
pause