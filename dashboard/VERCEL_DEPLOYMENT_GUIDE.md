# 🚀 Vercel Deployment Guide

Your nail salon dashboard is ready for production deployment! Here are two easy options:

## 📋 **OPTION 1: Direct CLI Deployment** (Recommended)

### Step 1: Login to Vercel
```bash
cd dashboard
npx vercel login
```
Choose "Continue with GitHub" and authorize in the browser.

### Step 2: Deploy
```bash
npx vercel --prod --yes
```

### Step 3: Set Environment Variables
After deployment, go to your Vercel dashboard and add these environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://irvyhhkoiyzartmmvbxw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMTgyOTMsImV4cCI6MjA3MDY5NDI5M30.8nKHdSX2wKh1YFiHN6wvP1zPEm9XzMgKUbgYOlEBYfE
NEXT_PUBLIC_DEMO_BUSINESS_ID=8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTExODI5MywiZXhwIjoyMDcwNjk0MjkzfQ.61Zfyc87GpmpIlWFL1fyX6wcfydqCu6DUFuHnpNSvhk
VAPI_API_KEY=1d33c846-52ba-46ff-b663-16fb6c67af9e
```

---

## 📋 **OPTION 2: GitHub Integration** (Set-and-forget)

### Step 1: Push to GitHub
```bash
# If not already in git repo
git init
git add .
git commit -m "Complete nail salon dashboard with customer booking"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/nail-salon-dashboard.git
git push -u origin main
```

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click "New Project"
4. Import your repository
5. Vercel will auto-detect Next.js settings

### Step 3: Configure Environment Variables
In Vercel dashboard → Project Settings → Environment Variables, add the variables listed above.

---

## 🎯 **WHAT YOU'LL GET AFTER DEPLOYMENT:**

### **Live URLs:**
- **Business Dashboard**: `https://your-app.vercel.app/dashboard`
- **Customer Portal**: `https://your-app.vercel.app/customer/portal`
- **Customer Login**: `https://your-app.vercel.app/customer/login`
- **Business Login**: `https://your-app.vercel.app/login`
- **Booking Widget**: `https://your-app.vercel.app/widget/8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad`

### **Features Ready for Testing:**
✅ **Customer Self-Booking** - Complete service selection → booking flow  
✅ **Appointment Management** - Reschedule/cancel functionality  
✅ **Business Dashboard** - Full salon management interface  
✅ **Real Database Integration** - All bookings saved to Supabase  
✅ **N8N Automation** - SMS/email notifications trigger automatically  

---

## 🧪 **POST-DEPLOYMENT TESTING CHECKLIST:**

### **Customer Portal Testing:**
- [ ] SMS login works
- [ ] "Book New Appointment" opens booking flow
- [ ] Service selection works
- [ ] Date/time picker shows availability  
- [ ] Customer info form validates
- [ ] Booking confirmation creates real appointment
- [ ] "Reschedule" button opens reschedule modal
- [ ] Reschedule date/time selection works
- [ ] Cancel appointment functionality works

### **Business Dashboard Testing:**
- [ ] Email login works
- [ ] Dashboard loads with business data
- [ ] Appointments list shows real bookings
- [ ] Customer list displays correctly
- [ ] Analytics charts render
- [ ] Settings pages load
- [ ] Voice AI configuration accessible
- [ ] Staff management functional
- [ ] Services management works

### **Integration Testing:**
- [ ] New bookings appear in business dashboard
- [ ] N8N automation triggers on booking
- [ ] Database updates reflect in real-time
- [ ] Mobile responsiveness works

---

## 🆘 **NEED HELP?**

If you encounter any issues:

1. **Build Errors**: Check the build logs in Vercel dashboard
2. **Environment Variables**: Ensure all variables are set correctly
3. **API Connections**: Verify Supabase and Railway URLs are correct
4. **Local Testing**: Run `npm run dev` locally first to debug

---

**🎉 Your complete nail salon platform is ready for the world!**

After deployment, you'll have a production-ready SaaS platform that salon owners can use to manage their business and customers can use for self-service booking.