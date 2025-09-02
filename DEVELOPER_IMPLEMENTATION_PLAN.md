# 🚀 3-Developer Implementation Plan - Vapi Nail Salon Agent
**Date:** September 2, 2025  
**Timeline:** 5-7 Days  
**Goal:** Complete all tier features for production launch

---

## 📁 Project Structure & Key Files

### Repository
- **GitHub:** https://github.com/dropflyai/vapi-nail-salon-agent
- **Main Dashboard:** `/dashboard` folder
- **Webhook Server:** `/webhook-server.js`
- **Database:** Supabase (credentials in `.env`)

### Key Environments
- **Dashboard:** https://vapi-nail-salon-agent-git-main-dropflyai.vercel.app
- **Webhook:** https://web-production-60875.up.railway.app
- **Phone:** (424) 351-9304
- **Supabase:** https://irvyhhkoiyzartmmvbxw.supabase.co

### Critical Files to Review First
1. `/CLAUDE.md` - Full project context and architecture
2. `/FEATURE_AUDIT.md` - What's missing and needs implementation
3. `/dashboard/.env.example` - Environment variables needed
4. `/webhook-server.js` - Voice AI integration point

---

## 👥 Developer Assignments

### Developer 1: Communications & Notifications
**Focus:** SMS, Email, and Notification Systems  
**Priority:** HIGHEST (other features depend on this)

### Developer 2: Analytics & Reporting  
**Focus:** Dashboard metrics, reports, business intelligence  
**Priority:** MEDIUM (can work independently)

### Developer 3: Business Features & Integrations
**Focus:** Multi-location, branding, white-label  
**Priority:** MEDIUM-LOW (builds on Dev 1's work)

---

## 📋 DEVELOPER 1: Communications Lead

### Day 1-2: SMS Automation (CRITICAL - BLOCKS OTHER FEATURES)

#### Task 1.1: Implement Twilio SMS Service
**Location:** Create `/dashboard/lib/sms-service.ts`
```typescript
// Template structure
export class SMSService {
  // Twilio credentials from .env:
  // TWILIO_ACCOUNT_SID=your-twilio-account-sid
  // TWILIO_AUTH_TOKEN=your-twilio-auth-token
  // TWILIO_PHONE_NUMBER=+14243519304
  
  async sendAppointmentConfirmation(appointment, customer)
  async sendAppointmentReminder(appointment, customer)
  async sendCancellationNotice(appointment, customer)
  async sendRescheduleNotice(appointment, customer)
}
```

#### Task 1.2: Hook SMS to Appointment Events
**Files to modify:**
- `/dashboard/lib/supabase.ts` - Add SMS triggers to:
  - `createAppointment()` - Send confirmation
  - `updateAppointment()` - Send reschedule notice
  - `cancelAppointment()` - Send cancellation
- `/webhook-server.js` - Add SMS to `bookAppointment()` function

#### Task 1.3: Create SMS Templates
**Location:** `/dashboard/lib/sms-templates.ts`
- Booking confirmation template
- 24-hour reminder template
- Cancellation template
- Reschedule template
- Include business name, date, time, service

#### Task 1.4: Add Reminder Scheduler
**Options:**
1. Use Vercel Cron Jobs (easiest)
2. Or use node-cron in webhook server
3. Or use Supabase Edge Functions

**Create:** `/dashboard/app/api/cron/appointment-reminders/route.ts`
- Run every hour
- Find appointments 24 hours out
- Send reminder SMS
- Mark as reminded in database

### Day 3-4: Email Service Integration

#### Task 1.5: Set up SendGrid/Resend
**Recommended:** Resend (easier, better DX)
```bash
npm install resend
```
**Environment variable needed:**
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

#### Task 1.6: Create Email Service
**Location:** `/dashboard/lib/email-service.ts`
```typescript
export class EmailService {
  async sendAppointmentConfirmation(appointment, customer)
  async sendWelcomeEmail(customer, business)
  async sendLoyaltyPointsEarned(points, customer)
  async sendMarketingCampaign(campaign, recipients)
}
```

#### Task 1.7: Create Email Templates
**Location:** `/dashboard/lib/email-templates/`
- Use React Email for templates (already in project)
- Create responsive HTML templates
- Include unsubscribe links (CAN-SPAM compliance)

#### Task 1.8: Connect Email Marketing UI
**Files to update:**
- `/dashboard/app/dashboard/marketing/page.tsx`
- `/dashboard/app/api/email/campaign/send/route.ts`
- Add actual sending logic using email service

### Dependencies Created for Others:
- ✅ SMS service that Dev 3 can use for multi-location
- ✅ Email service that Dev 2 can use for reports
- ✅ Notification system foundation

---

## 📊 DEVELOPER 2: Analytics & Reporting Lead

### Day 1-2: Enhanced Analytics Dashboard

#### Task 2.1: Add Revenue Metrics
**File:** `/dashboard/app/dashboard/analytics/page.tsx`
**Add metrics for:**
- Daily/Weekly/Monthly revenue
- Average ticket size
- Revenue by service type
- Revenue by staff member

**Data source:** Query appointments with payment status

#### Task 2.2: Service Analytics
**Create:** Service popularity tracking
- Most booked services
- Service revenue ranking
- Service duration accuracy
- Cancellation rate by service

#### Task 2.3: Customer Analytics
**Add metrics:**
- New vs returning customers
- Customer lifetime value
- Retention rate
- Churn analysis
- Top customers by revenue

#### Task 2.4: Staff Performance
**File:** `/dashboard/components/StaffPerformance.tsx`
- Appointments per staff
- Revenue per staff
- Average rating (future)
- Utilization rate
- Commission calculations

### Day 3-4: Reporting System

#### Task 2.5: Create Report Generator
**Location:** `/dashboard/lib/report-generator.ts`
```typescript
export class ReportGenerator {
  async generateDailyReport(businessId, date)
  async generateWeeklyReport(businessId, weekStart)
  async generateMonthlyReport(businessId, month)
  async generateCustomReport(businessId, startDate, endDate, metrics)
}
```

#### Task 2.6: PDF Export Capability
**Install:** 
```bash
npm install @react-pdf/renderer
```
**Create:** `/dashboard/components/reports/`
- Daily report template
- Weekly report template
- Monthly report template
- Custom report builder

#### Task 2.7: Automated Report Emails
**Depends on Dev 1's email service**
**Create:** `/dashboard/app/api/cron/daily-reports/route.ts`
- Send daily reports at 9 PM
- Weekly reports on Mondays
- Monthly reports on 1st

### Day 5: Cross-Location Analytics (Business Tier)

#### Task 2.8: Multi-Location Dashboard
**Create:** `/dashboard/app/dashboard/analytics/multi-location/page.tsx`
- Location comparison charts
- Aggregate metrics
- Best/worst performing locations
- Staff utilization across locations

#### Task 2.9: Location Report Comparison
- Side-by-side location metrics
- Export combined reports
- Trend analysis per location

### Dependencies:
- Needs Dev 1's email service for automated reports
- Creates analytics Dev 3 needs for white-label

---

## 🏢 DEVELOPER 3: Business Features Lead

### Day 1-2: Custom Branding System

#### Task 3.1: Logo Upload System
**File:** `/dashboard/app/dashboard/settings/branding/page.tsx`
**Implementation:**
- Use Supabase Storage for logo storage
- Add logo field to businesses table
- Display logo in booking widget
- Display in customer portal

#### Task 3.2: Color Scheme Customization
**Add to business settings:**
- Primary color
- Secondary color
- Accent color
- Apply to booking widget
- Apply to customer portal

#### Task 3.3: Booking Widget Customization
**File:** `/dashboard/components/BookingWidget.tsx`
**Make dynamic:**
- Pull business branding from database
- Apply custom colors
- Show business logo
- Custom thank you message

### Day 3-4: Multi-Location Features

#### Task 3.4: Location Switching UI
**File:** `/dashboard/components/LocationSwitcher.tsx`
- Dropdown to switch between locations
- Store selected location in context
- Filter all data by location

#### Task 3.5: Cross-Location Staff Management
**Update:** `/dashboard/app/dashboard/staff/page.tsx`
- Assign staff to multiple locations
- Set different schedules per location
- Track performance per location

#### Task 3.6: Location-Specific Settings
- Different hours per location
- Different services per location
- Different pricing per location

### Day 5-6: White-Label Preparation

#### Task 3.7: Custom Domain Support
**Research & Document:**
- Vercel custom domains API
- DNS configuration requirements
- SSL certificate handling
- Create setup guide

#### Task 3.8: White-Label Admin Panel
**Create:** `/dashboard/app/admin/white-label/page.tsx`
- Manage white-label clients
- Set custom domains
- Override branding completely
- Separate billing per white-label

#### Task 3.9: Environment-Based Theming
**Create:** Theme system that checks domain
- If custom domain, load custom theme
- Override all branding elements
- Hide platform branding

### Dependencies:
- Needs Dev 1's SMS/Email for multi-location notifications
- Uses Dev 2's analytics for location comparison

---

## 🔄 Daily Sync Protocol

### Morning Standup (10 min)
1. What was completed yesterday?
2. What's being worked on today?
3. Any blockers or dependencies?

### Shared Communication
**Slack/Discord Channel:** #vapi-nail-implementation
- Post when completing a task
- Alert others when their dependency is ready
- Share any discovered issues

### Git Workflow
```bash
# Each developer works on their own branch
git checkout -b dev1-communications
git checkout -b dev2-analytics  
git checkout -b dev3-business-features

# Daily merges to main
git pull origin main
git merge main
git push origin [your-branch]

# Create PR when feature complete
```

### Testing Protocol
1. Test your feature locally
2. Deploy to staging (Vercel preview)
3. Test with real phone number (424) 351-9304
4. Get sign-off from another dev
5. Merge to main

---

## 📦 Shared Dependencies & Environment Variables

### Required NPM Packages
```json
{
  "dependencies": {
    "twilio": "^4.19.0",        // Dev 1
    "resend": "^2.0.0",          // Dev 1
    "node-cron": "^3.0.3",       // Dev 1
    "@react-pdf/renderer": "^3.1.14", // Dev 2
    "recharts": "^2.10.3",       // Dev 2 (already installed)
    "sharp": "^0.33.1",          // Dev 3 (image processing)
    "@vercel/domains": "^0.1.0"  // Dev 3
  }
}
```

### Environment Variables Needed
```env
# SMS (Dev 1)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+14243519304

# Email (Dev 1)
RESEND_API_KEY=re_xxxxxxxxxxxxx  # Need to get
EMAIL_FROM=notifications@yourdomain.com

# Analytics (Dev 2)
REPORT_TIMEZONE=America/Los_Angeles
DAILY_REPORT_TIME=21:00

# White Label (Dev 3)
PLATFORM_DOMAIN=dropfly.ai
WHITE_LABEL_ENABLED=true

# Already configured
VAPI_API_KEY=1d33c846-52ba-46ff-b663-16fb6c67af9e
SUPABASE_URL=https://irvyhhkoiyzartmmvbxw.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...
```

---

## 🎯 Success Criteria

### Dev 1 Success:
- [ ] SMS confirmations sending automatically
- [ ] 24-hour reminders working
- [ ] Email service connected
- [ ] Marketing campaigns can be sent

### Dev 2 Success:
- [ ] Revenue metrics displaying
- [ ] Staff performance tracking
- [ ] PDF reports generating
- [ ] Multi-location analytics working

### Dev 3 Success:
- [ ] Logo upload working
- [ ] Custom colors applied
- [ ] Multi-location switching works
- [ ] White-label documentation complete

---

## 🚨 Common Gotchas & Solutions

### Supabase RLS (Row Level Security)
- Most tables have RLS enabled
- Use service role key for admin operations
- Check policies if getting empty results

### Vercel Deployment
- Environment variables must be added in Vercel dashboard
- Use `NEXT_PUBLIC_` prefix for client-side vars
- Redeploy after adding new env vars

### Phone Number Routing
- All calls go through webhook-server.js
- Business routing based on phone_business_mapping table
- Test with real phone calls to (424) 351-9304

### Multi-Tenant Isolation
- Always filter by business_id
- Check authentication context
- Test with multiple business accounts

---

## 📞 Support & Resources

### Documentation
- Twilio Docs: https://www.twilio.com/docs/sms
- Resend Docs: https://resend.com/docs
- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs

### Test Accounts
- Bella's Nails Studio: bb18c6ca-7e97-449d-8245-e3c28a6b6971
- Test Customer: Eric Scott (170 loyalty points)
- Phone: (424) 351-9304

### Getting Help
1. Check CLAUDE.md for architecture decisions
2. Review existing code patterns
3. Ask in Slack channel
4. Tag other devs for dependencies

---

## 🏁 Launch Checklist

Once all tasks complete:
1. [ ] All SMS notifications tested
2. [ ] Email templates reviewed
3. [ ] Analytics showing real data
4. [ ] Reports generating correctly
5. [ ] Multi-location tested
6. [ ] Branding applied successfully
7. [ ] Production environment variables set
8. [ ] Load testing completed
9. [ ] Security review done
10. [ ] Documentation updated

---

**Remember:** Payment processing is intentionally saved for last. Focus on getting all other features production-ready first!