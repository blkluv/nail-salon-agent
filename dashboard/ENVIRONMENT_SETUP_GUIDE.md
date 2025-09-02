# 📧 Dev 1 Communication Setup Guide

## 🎯 What's Been Implemented

✅ **SMS Automation System** - Complete Twilio integration
✅ **Email Service** - Professional Resend integration  
✅ **24-Hour Reminders** - Automated cron job system
✅ **Appointment Notifications** - Cancel/reschedule SMS + Email
✅ **Loyalty Email Notifications** - Points earned emails
✅ **Marketing Campaigns** - Mass email sending capability

## 🔧 Environment Variables Needed

Add these to your `.env.local` file in the `/dashboard` folder:

### SMS Configuration (Twilio)
```env
# Get these from: https://console.twilio.com
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+14243519304
```

### Email Configuration (Resend)
```env
# Get API key from: https://resend.com/api-keys
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM="Your Salon <notifications@yourdomain.com>"
```

### Already Configured
```env
# These should already be set
NEXT_PUBLIC_SUPABASE_URL=https://irvyhhkoiyzartmmvbxw.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🚀 Quick Setup Steps

### 1. **Twilio Setup** (SMS already working via n8n, but this adds more features)
- Go to https://console.twilio.com
- Phone number already configured: (424) 351-9304
- Get Account SID and Auth Token from dashboard
- Add to environment variables

### 2. **Resend Setup** (New email service)
- Sign up at https://resend.com
- Get API key from dashboard
- Add to environment variables
- Verify domain for production sending

### 3. **Database Migration**
Run this SQL in Supabase to add the reminder column:
```sql
-- Run in Supabase SQL Editor
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_check 
ON appointments (appointment_date, reminder_sent, status);
```

## 📱 What Works Right Now

### ✅ SMS Notifications
- **Appointment Cancellations**: Automatically sent when customer cancels
- **Appointment Reschedules**: Sent when date/time changes
- **24-Hour Reminders**: Cron job runs hourly on Vercel

### ✅ Email Notifications  
- **Appointment Cancellations**: Professional HTML emails
- **Loyalty Points**: Automatic emails when points are earned
- **Welcome Emails**: For new customers
- **Marketing Campaigns**: Mass email sending via dashboard

### ✅ Cron Job System
- **Reminder Scheduler**: `/api/cron/reminders` runs every hour
- **Vercel Cron**: Configured in `vercel.json`
- **Auto-marking**: Appointments marked as "reminded" to prevent duplicates

## 🧪 Testing Your Setup

### Test SMS Service
```javascript
// Test in browser console
fetch('/api/test-sms', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: '+1YOUR_PHONE_NUMBER',
    message: 'Test message from your salon!'
  })
})
```

### Test Email Service
```javascript
// Test in browser console  
fetch('/api/test-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'your@email.com',
    subject: 'Test Email',
    customerName: 'Test Customer'
  })
})
```

### Test Marketing Campaign
```javascript
// Send test campaign
fetch('/api/email/campaign/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipients: ['test@example.com'],
    subject: 'Test Campaign',
    content: '<h1>Hello from your salon!</h1>',
    businessId: 'your-business-id'
  })
})
```

## 🔗 Integration Points

### Other Developers Can Now Use:
- **Dev 2**: Email service for automated reports (`EmailService.sendEmail()`)
- **Dev 3**: SMS/Email for multi-location notifications
- **Future**: Payment receipts, booking confirmations, etc.

### Files That Auto-Send Notifications:
- `/dashboard/lib/supabase.ts` → `cancelAppointment()` (SMS + Email)
- `/dashboard/lib/supabase.ts` → `updateAppointment()` (SMS for reschedules)  
- `/dashboard/lib/supabase.ts` → `awardLoyaltyPoints()` (Email)
- `/dashboard/app/api/cron/reminders/route.ts` (24hr SMS reminders)

## ⚠️ Important Notes

1. **SMS Rate Limits**: Twilio has limits, implement queuing for bulk
2. **Email Deliverability**: Verify custom domains in Resend for production
3. **Unsubscribe Links**: Marketing emails include unsubscribe (required by law)
4. **Error Handling**: SMS/Email failures don't break appointment operations
5. **Phone Format**: Always use E.164 format (+1XXXXXXXXXX)

## 🎉 You're Done!

**Communications system is now fully operational!** 

All appointment events (cancel, reschedule) will automatically trigger SMS + Email notifications. 24-hour reminders run automatically. Marketing campaigns can be sent from the dashboard.

**Next**: Dev 2 can now use your email service for automated reports!
**Next**: Dev 3 can use your SMS/Email services for multi-location features!