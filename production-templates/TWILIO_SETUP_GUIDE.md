# Twilio SMS Setup Guide for Nail Salon Voice AI

## 🚀 Quick Setup Checklist

- [ ] Create Twilio account
- [ ] Get Account SID and Auth Token
- [ ] Purchase/configure phone number
- [ ] Set up webhook URL
- [ ] Add environment variables
- [ ] Test SMS integration

## 1. Create Twilio Account

1. Go to [twilio.com](https://twilio.com)
2. Click "Sign up for free"
3. Fill out your information:
   - Business name: "Your Nail Salon Name"
   - Business type: "Beauty/Wellness"
   - Use case: "Customer notifications"
4. Complete phone verification

## 2. Get Your Credentials

### Account SID and Auth Token
1. Go to Twilio Console Dashboard
2. Find "Account Info" section on right side
3. Copy your **Account SID** (starts with "AC...")
4. Click "Auth Token" to reveal it, then copy

### Find Your Phone Number
1. In Twilio Console, go to **Phone Numbers > Manage > Active numbers**
2. You should see: `+14243519304` (your current number)
3. Click on the number to configure it

## 3. Configure Your Phone Number

### Set Webhook URL for SMS
1. Click on your phone number `+14243519304`
2. In "Messaging" section:
   - **Webhook URL**: `https://vapi-nail-salon-agent-production.up.railway.app/webhook/sms`
   - **HTTP Method**: `POST`
3. Click "Save configuration"

### Test the Webhook
```bash
# Test that your webhook URL is working
curl -X POST https://vapi-nail-salon-agent-production.up.railway.app/webhook/sms \
  -d "Body=test&From=+1234567890&To=+14243519304"
```

## 4. Environment Variables

Add these to your Railway deployment:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+14243519304

# Optional: Email notifications
EMAIL_FROM=hello@glamournails.com
SALON_PHONE=(424) 351-9304
```

### Setting Environment Variables in Railway

1. Go to your Railway project dashboard
2. Click on your deployment
3. Go to "Variables" tab
4. Add each variable one by one:
   - Key: `TWILIO_ACCOUNT_SID`
   - Value: `AC...` (your actual SID)
   - Click "Add"
   - Repeat for `TWILIO_AUTH_TOKEN` and `TWILIO_PHONE_NUMBER`

## 5. Update Your Webhook Server

Add the SMS integration to your main webhook server:

```javascript
// In webhook-server.js, add at the top
const express = require('express');
const { addSMSWebhookToServer } = require('./production-templates/twilio-sms-integration');

// After creating your app and supabase client, add:
addSMSWebhookToServer(app, supabase);
```

## 6. Test SMS Functionality

### Test Outgoing SMS (Booking Confirmation)
```javascript
const { TwilioSMSService } = require('./production-templates/twilio-sms-integration');

const smsService = new TwilioSMSService();

// Test booking confirmation
const testAppointment = {
    customer_name: 'Sarah',
    customer_phone: '+1234567890', // Replace with your test number
    service_name: 'gel manicure',
    appointment_date: '2024-03-15',
    start_time: '14:00'
};

smsService.sendBookingConfirmation(testAppointment);
```

### Test Incoming SMS
1. Text your Twilio number: `+14243519304`
2. Send message: "book appointment"
3. Check your webhook logs for incoming SMS processing

## 7. Automated SMS Scheduling

### Set up Cron Jobs (Recommended)

Create a cron job file or use Railway's cron addon:

```javascript
// cron-jobs.js
const { SMSScheduler } = require('./production-templates/twilio-sms-integration');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const scheduler = new SMSScheduler(supabase);

// Run every day at 10 AM to send 24h reminders
async function dailyReminders() {
    await scheduler.send24HourReminders();
}

// Run every hour to send 2h reminders
async function hourlyReminders() {
    await scheduler.send2HourReminders();
}

// Run every 2 hours to send thank you messages
async function thankYouMessages() {
    await scheduler.sendThankYouMessages();
}

module.exports = {
    dailyReminders,
    hourlyReminders,
    thankYouMessages
};
```

### Railway Cron Setup
1. In your Railway project, go to "Settings"
2. Add a new service with type "Cron"
3. Set schedules:
   - `0 10 * * *` - Daily at 10 AM (24h reminders)
   - `0 * * * *` - Every hour (2h reminders)
   - `0 */2 * * *` - Every 2 hours (thank you messages)

## 8. Common SMS Commands Your Customers Can Use

| Customer Texts | System Response |
|---|---|
| "cancel" or "stop" | Cancels their next appointment |
| "yes" or "confirm" | Confirms their upcoming appointment |
| "book" or "appointment" | Directs them to call AI booking |
| "hours" or "open" | Shows business hours |
| "price" or "cost" | Shows service pricing |
| "location" or "address" | Shows salon address |
| After-hours text | Auto-responder with AI booking info |

## 9. SMS Best Practices

### Character Limits
- Keep messages under 160 characters for single SMS
- Template messages are pre-optimized

### Compliance
- Always include business name
- Provide opt-out instructions ("Reply STOP to opt out")
- Include contact number for support

### Timing
- Send confirmations immediately after booking
- Send 24h reminders at 10 AM (not too early/late)
- Send 2h reminders only during business hours
- Thank you messages 2 hours after appointment

## 10. Troubleshooting

### SMS Not Sending
1. Check Twilio Console > Logs for error messages
2. Verify Account SID and Auth Token are correct
3. Ensure phone number is in E.164 format (`+1234567890`)
4. Check Twilio account balance

### SMS Not Receiving
1. Verify webhook URL is publicly accessible
2. Check webhook logs for incoming messages
3. Ensure webhook URL is set correctly in Twilio Console
4. Test webhook with curl command above

### Common Error Messages

| Error | Solution |
|---|---|
| "The number +1234567890 is not a valid phone number" | Format as E.164: +1234567890 |
| "Authenticate" | Check Account SID and Auth Token |
| "Webhook timeout" | Ensure webhook responds within 15 seconds |
| "Invalid signature" | Check webhook URL and Twilio auth token |

## 11. Costs and Limits

### Twilio Pricing (as of 2024)
- SMS in US: $0.0075 per message sent
- SMS received: $0.0075 per message
- Phone number: $1.00/month

### Estimated Monthly Costs
- 100 appointments/month = ~400 SMS = $3/month
- 200 appointments/month = ~800 SMS = $6/month
- Plus $1/month for phone number

### Free Trial
- Twilio gives $15.50 credit for new accounts
- Can handle ~2,000 SMS messages for testing

## 12. Support and Monitoring

### Monitor SMS Usage
1. Twilio Console > Usage > SMS
2. Track delivery rates and costs
3. Set up usage alerts

### Customer Support
- Include salon phone number in all messages
- Train staff to handle SMS-related questions
- Monitor SMS logs for customer issues

---

## ✅ Final Checklist

- [ ] Twilio account created and verified
- [ ] Account SID and Auth Token copied
- [ ] Phone number `+14243519304` configured with webhook
- [ ] Environment variables added to Railway
- [ ] SMS integration added to webhook server
- [ ] Test messages sent and received successfully
- [ ] Automated scheduling set up (optional)
- [ ] Staff trained on SMS customer support

**Need Help?** Check Twilio's documentation or contact their support team.

**Your SMS Integration Is Ready!** 🎉

Customers can now receive booking confirmations, reminders, and interact with your salon via text message.