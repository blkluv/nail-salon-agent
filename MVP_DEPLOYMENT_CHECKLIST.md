# 🎯 MVP PRODUCTION DEPLOYMENT CHECKLIST

**Goal**: Get your nail salon booking platform 100% production-ready  
**Current Status**: 75% Complete  
**Estimated Time to 100%**: 2-3 hours

---

## 📋 PRIORITY 1: CRITICAL PATH (Must Complete First)

### ✅ Already Complete
- [x] Voice AI booking system deployed
- [x] Database schema created
- [x] Multi-tenant webhook routing
- [x] Backend APIs deployed
- [x] N8N workflow created

### 🔴 1. N8N Workflow Activation (15 minutes)
- [ ] Open https://botthentic.com
- [ ] Navigate to "Salon Post-Booking Automation" workflow
- [ ] Configure Twilio credentials:
  - [ ] Account SID: (from your .env file)
  - [ ] Auth Token: (from your .env file)
  - [ ] Phone Number: (from your .env file)
- [ ] Configure Gmail OAuth (or skip for now)
- [ ] **ACTIVATE the workflow** (toggle switch)
- [ ] Test with: `node test-n8n-integration.js`

### 🔴 2. Verify Railway Deployment (10 minutes)
- [ ] Check Railway dashboard for webhook server status
- [ ] Verify environment variables:
  ```
  SUPABASE_URL ✓
  SUPABASE_SERVICE_KEY ✓
  N8N_WEBHOOK_URL = https://botthentic.com/webhook/TcnJnzpUZqIWbOFU/salon-booking-automation
  TWILIO_ACCOUNT_SID ✓
  TWILIO_AUTH_TOKEN ✓
  TWILIO_PHONE_NUMBER ✓
  JWT_SECRET ✓
  ```
- [ ] Check Railway logs for any errors
- [ ] Test webhook endpoint: https://web-production-60875.up.railway.app/health

### 🔴 3. Dashboard Deployment to Vercel (20 minutes)
- [ ] Navigate to `vapi-nail-salon-agent/dashboard` directory
- [ ] Create/update `.env.local`:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://irvyhhkoiyzartmmvbxw.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  NEXT_PUBLIC_API_URL=https://web-production-60875.up.railway.app
  ```
- [ ] Deploy to Vercel:
  ```bash
  cd dashboard
  vercel --prod
  ```
- [ ] Note the Vercel URL: _______________
- [ ] Test dashboard access

---

## 📋 PRIORITY 2: CORE FUNCTIONALITY (Complete Today)

### 🟡 4. Test Voice AI Booking Flow (15 minutes)
- [ ] Call (424) 351-9304
- [ ] Test booking appointment
- [ ] Verify appointment in Supabase
- [ ] Check N8N execution logs
- [ ] Confirm SMS received (if Twilio working)
- [ ] Confirm email received (if Gmail configured)

### 🟡 5. Twilio SMS Testing (10 minutes)
- [ ] Verify Twilio phone number capabilities
- [ ] Test sending SMS from Twilio console
- [ ] Update N8N workflow with verified number
- [ ] Test appointment booking with SMS
- [ ] Document any issues: _______________

### 🟡 6. Customer Portal Activation (15 minutes)
- [ ] Test SMS authentication: `/api/customer/auth/send-verification`
- [ ] Verify OTP delivery
- [ ] Test login flow
- [ ] Check JWT token generation
- [ ] Test portal endpoints

### 🟡 7. Business Configuration (10 minutes)
- [ ] Update default business in Supabase:
  ```sql
  UPDATE businesses 
  SET 
    name = 'Your Salon Name',
    phone = 'Your Phone',
    email = 'your-email@domain.com',
    address = 'Your Address',
    status = 'active'
  WHERE id = '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad';
  ```
- [ ] Add business hours
- [ ] Configure services and pricing
- [ ] Set up at least one staff member

---

## 📋 PRIORITY 3: PAYMENT & COMMUNICATIONS (Complete Tomorrow)

### 🔵 8. Payment Processing Setup (30 minutes)
- [ ] **Square Setup** (recommended):
  - [ ] Create Square account
  - [ ] Get Sandbox credentials for testing
  - [ ] Add to environment variables
  - [ ] Test payment flow
- [ ] **OR Stripe Setup**:
  - [ ] Create Stripe account
  - [ ] Get test API keys
  - [ ] Add to environment variables
  - [ ] Test payment flow

### 🔵 9. Email Configuration (20 minutes)
- [ ] **Gmail OAuth Setup**:
  - [ ] Enable Gmail API in Google Cloud Console
  - [ ] Create OAuth 2.0 credentials
  - [ ] Configure in N8N
  - [ ] Test email sending
- [ ] **OR SMTP Setup**:
  - [ ] Configure SMTP credentials
  - [ ] Update N8N email node
  - [ ] Test email delivery

### 🔵 10. Google Calendar Integration (15 minutes)
- [ ] Enable Google Calendar API
- [ ] Create service account
- [ ] Share calendar with service account
- [ ] Configure in N8N workflow
- [ ] Test appointment sync

---

## 📋 PRIORITY 4: TESTING & VALIDATION (Before Launch)

### 🟢 11. End-to-End Testing (30 minutes)
- [ ] **Voice Booking Test**:
  - [ ] Book via phone
  - [ ] Receive SMS confirmation
  - [ ] Receive email confirmation
  - [ ] Check database entry
  - [ ] Verify analytics logged

- [ ] **Web Booking Test**:
  - [ ] Book via web widget
  - [ ] Receive confirmations
  - [ ] Check database

- [ ] **Customer Portal Test**:
  - [ ] Register new customer
  - [ ] View appointments
  - [ ] Cancel appointment
  - [ ] Check loyalty points

- [ ] **Multi-Business Test**:
  - [ ] Create second business
  - [ ] Test isolated booking
  - [ ] Verify data separation

### 🟢 12. Performance & Security (20 minutes)
- [ ] Test rate limiting on auth endpoints
- [ ] Verify JWT token expiration
- [ ] Check SQL injection protection
- [ ] Test webhook authentication
- [ ] Monitor response times
- [ ] Check error handling

---

## 📋 PRIORITY 5: PRODUCTION READINESS (Final Steps)

### ⚫ 13. Monitoring Setup (15 minutes)
- [ ] Set up Railway metrics monitoring
- [ ] Configure Supabase alerts
- [ ] Set up N8N error notifications
- [ ] Create uptime monitoring (UptimeRobot)
- [ ] Configure error tracking (Sentry optional)

### ⚫ 14. Documentation (20 minutes)
- [ ] Create admin guide
- [ ] Document common issues
- [ ] Create customer FAQ
- [ ] Update README with production URLs
- [ ] Document API endpoints

### ⚫ 15. Backup & Recovery (10 minutes)
- [ ] Enable Supabase automatic backups
- [ ] Export N8N workflow backup
- [ ] Document recovery procedures
- [ ] Save all credentials securely
- [ ] Create rollback plan

---

## 🚨 QUICK FIXES NEEDED

### Immediate Code Fixes Required:
1. **Add fetch error handling** in webhook-server.js
2. **Add connection pooling** for Supabase
3. **Add request logging** for debugging
4. **Environment variable validation** on startup

---

## 📊 LAUNCH READINESS SCORECARD

| Component | Status | Action Required |
|-----------|--------|----------------|
| Voice AI | ✅ Ready | None |
| Database | ✅ Ready | Add sample data |
| Webhook Server | ✅ Ready | Monitor logs |
| N8N Workflow | 🔴 Inactive | Activate & configure |
| SMS System | 🟡 Partial | Test Twilio |
| Email System | 🔴 Not configured | Setup Gmail OAuth |
| Dashboard | 🔴 Not deployed | Deploy to Vercel |
| Customer Portal | 🟡 Backend ready | Test auth flow |
| Payments | 🔴 Not setup | Add Square/Stripe |
| Analytics | ✅ Ready | None |
| Multi-tenant | ✅ Ready | Test isolation |

---

## 🎯 TODAY'S CRITICAL PATH (Do These Now!)

### Next 30 Minutes:
1. [ ] Activate N8N workflow
2. [ ] Configure Twilio in N8N
3. [ ] Test booking with SMS confirmation

### Next Hour:
4. [ ] Deploy dashboard to Vercel
5. [ ] Test customer portal auth
6. [ ] Verify end-to-end flow

### By End of Day:
7. [ ] Complete all Priority 1 & 2 items
8. [ ] Document any blockers
9. [ ] Plan tomorrow's payment setup

---

## 📞 SUPPORT RESOURCES

- **Railway Dashboard**: https://railway.app
- **N8N Instance**: https://botthentic.com
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Vercel Dashboard**: https://vercel.com
- **Twilio Console**: https://console.twilio.com

---

## ✅ DEFINITION OF "100% READY"

The MVP is considered 100% production-ready when:
- [ ] Voice AI takes bookings successfully
- [ ] SMS confirmations send automatically
- [ ] Email confirmations send automatically
- [ ] Dashboard is accessible online
- [ ] Customer portal authentication works
- [ ] At least one payment method configured
- [ ] 10 successful test bookings completed
- [ ] All Priority 1-3 items checked

---

**Time Estimate to 100%**: 
- With focused effort: 2-3 hours
- Spread over 2 days: 1-2 hours per day

**Current Blockers**: None identified

**Ready to start?** Let's begin with activating the N8N workflow!