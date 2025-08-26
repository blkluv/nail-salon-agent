# 🚂 Railway Deployment Guide

## Quick Deploy to Railway

### Step 1: Push to GitHub
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Production-ready webhook with fixes"

# Push to GitHub (create new repo if needed)
git remote add origin https://github.com/yourusername/vapi-nail-salon-agent
git push -u origin main
```

### Step 2: Deploy via Railway Web
1. **Go to [railway.app](https://railway.app/new)**
2. **Click "Deploy from GitHub repo"**
3. **Select your repository**
4. **Railway will auto-detect Node.js and use your Procfile**

### Step 3: Set Environment Variables in Railway
Go to your project → Variables tab → Add these:

```env
SUPABASE_URL=https://irvyhhkoiyzartmmvbxw.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTExODI5MywiZXhwIjoyMDcwNjk0MjkzfQ.61Zfyc87GpmpIlWFL1fyX6wcfydqCu6DUFuHnpNSvhk
NODE_ENV=production
DEFAULT_BUSINESS_ID=8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad
```

### Step 4: Get Railway URL
After deployment completes:
1. **Go to Settings → Networking**
2. **Generate Domain** → Copy the Railway URL (e.g., `https://your-app-name.railway.app`)

### Step 5: Update Vapi Tools
Update all 4 Vapi tool webhook URLs to point to:
`https://your-railway-url.railway.app/webhook/vapi`

## Troubleshooting

### ❌ Build Failed
- **Check logs** in Railway dashboard
- **Verify package.json** has all dependencies
- **Ensure Node.js version** is compatible (16+)

### ❌ Environment Variables
- **Double-check** all variables are set in Railway
- **No spaces** around `=` in variable names
- **Use the exact values** from .env.example

### ❌ Database Connection Failed
- **Test Supabase URL** is accessible
- **Verify service key** has proper permissions
- **Check firewall/network** restrictions

### ❌ Webhook Not Responding
- **Check Railway logs** for errors
- **Verify URL** is `https://your-app.railway.app/webhook/vapi`
- **Test with curl** to confirm endpoint is live

### ❌ Function Calls Failing
- **Check console logs** in Railway
- **Verify business hours** are configured in database
- **Test each function** individually

## Success Indicators
✅ **Deployment Status: LIVE**
✅ **Health Check: `/` returns JSON response**
✅ **Webhook Endpoint: `/webhook/vapi` responds**  
✅ **Database Connection: Supabase queries work**
✅ **Function Calls: All 4 tools respond correctly**