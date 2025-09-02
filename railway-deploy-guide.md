# 🚀 Manual Railway Deployment Guide

## Issue Identified
✅ Railway webhook is using old hardcoded business ID  
✅ Need to deploy production webhook with latest business lookup  
✅ Appointment creation worked but went to wrong business  

## Manual Deployment Steps

### Option 1: Railway Dashboard (Easiest)
1. Go to https://railway.app/dashboard
2. Find project: `web-production-60875`
3. Navigate to "Settings" → "Environment"
4. Add/update environment variables if needed
5. Go to "Deployments" 
6. Upload new `webhook-server.js` file

### Option 2: Git Deployment
1. Create a new branch: `git checkout -b production-deploy`
2. Add only production files:
   ```bash
   git add webhook-server.js package.json
   git commit -m "Deploy production webhook with latest business lookup"
   ```
3. Push and let Railway auto-deploy

### Option 3: Railway CLI (If we can link)
```bash
railway link [project-id]
railway up
```

## Production Webhook Features
✅ **Latest Business Lookup** - Uses newest business automatically  
✅ **Business Context Injection** - Personalized responses  
✅ **Enhanced Error Handling** - No silent failures  
✅ **Multi-tenant Support** - Proper business isolation  

## Testing After Deployment
1. Check: `https://web-production-60875.up.railway.app/health`
2. Should show: `"version": "production-v2.0"`  
3. Call (424) 351-9304 and book appointment
4. Verify appointment appears in Bella's dashboard

## Expected Results
- Appointments created with Bella's business ID: `bb18c6ca-7e97-449d-8245-e3c28a6b6971`
- Dashboard shows appointments correctly
- Business context injection works

The production webhook is ready - just needs to be deployed to Railway! 🎯