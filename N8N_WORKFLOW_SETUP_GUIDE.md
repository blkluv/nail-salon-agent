# 🤖 N8N Post-Booking Automation Setup Guide

## 📋 Overview

This guide will help you set up the complete post-booking automation workflow using N8N. After a customer books an appointment via your AI assistant, this workflow automatically:

1. **Sends SMS confirmation** 📱
2. **Sends professional email confirmation** 📧  
3. **Adds appointment to Google Calendar** 📅
4. **Schedules reminder messages** ⏰
5. **Updates customer analytics** 📊
6. **Logs business metrics** 📈

## 🔧 Prerequisites

### Required Services & Accounts
- [ ] **N8N Instance** (self-hosted or n8n.cloud)
- [ ] **Twilio Account** (for SMS)
- [ ] **Gmail/Google Workspace** (for email)
- [ ] **Google Calendar API** (for calendar integration)
- [ ] **Supabase Database** (already configured)

### Required Credentials
- [ ] Twilio Account SID, Auth Token, Phone Number
- [ ] Gmail OAuth2 credentials
- [ ] Google Calendar OAuth2 credentials
- [ ] Supabase connection details

## 📥 Step 1: Import the Workflow

### 1.1 Download the Workflow File
The workflow is saved as: `n8n-post-booking-workflow.json`

### 1.2 Import into N8N
1. Open your N8N instance
2. Click **"Import from file"** or **"+"** → **"Import from file"**
3. Select the `n8n-post-booking-workflow.json` file
4. Click **"Import"**

### 1.3 Workflow Overview
The imported workflow includes these nodes:
- **Webhook Trigger** - Receives booking data from your webhook server
- **Event Validation** - Ensures it's an `appointment_booked` event
- **SMS Confirmation** - Sends immediate SMS confirmation
- **Email Confirmation** - Sends professional HTML email
- **Calendar Integration** - Adds appointment to Google Calendar
- **Database Updates** - Updates customer stats and analytics
- **Reminder System** - Scheduled 24hr and 2hr reminders (optional)

## 🔑 Step 2: Configure Credentials

### 2.1 Twilio SMS Credentials
1. In N8N, go to **Settings** → **Credentials**
2. Click **"Create New"** → Select **"Twilio"**
3. Enter your credentials:
   ```
   Name: Twilio Account
   Account SID: [Your Twilio Account SID]
   Auth Token: [Your Twilio Auth Token]
   Phone Number: [Your Twilio Phone Number, e.g., +14243519304]
   ```
4. **Test** the connection and **Save**

### 2.2 Gmail Email Credentials  
1. Create **"Gmail OAuth2"** credential
2. Follow N8N's Gmail setup guide to get:
   - Client ID
   - Client Secret
   - Access Token
   - Refresh Token
3. Name it: `Gmail Account`

### 2.3 Google Calendar Credentials
1. Create **"Google Calendar OAuth2"** credential
2. Use same Google project as Gmail or create new one
3. Name it: `Google Calendar`

### 2.4 Supabase Database Credentials
1. Create **"Postgres"** credential
2. Enter your Supabase details:
   ```
   Name: Supabase Database
   Host: db.irvyhhkoiyzartmmvbxw.supabase.co
   Port: 5432
   Database: postgres
   Username: postgres
   Password: [Your Supabase password]
   SSL: Enable
   ```

## 🔗 Step 3: Configure Webhook Integration

### 3.1 Get Your N8N Webhook URL
1. Open the workflow in N8N
2. Click on the **"Booking Webhook"** node
3. Copy the **Webhook URL** (should look like):
   ```
   https://your-n8n-instance.com/webhook/booking-automation
   ```

### 3.2 Add Environment Variable
Add this to your webhook server's environment variables:

```env
# N8N Integration
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/booking-automation
```

### 3.3 Update Railway Environment
1. Go to your **Railway** dashboard
2. Select your **webhook server** project
3. Go to **Variables** tab
4. Add: `N8N_WEBHOOK_URL` with your webhook URL
5. **Deploy** the changes

## ⚙️ Step 4: Customize the Workflow

### 4.1 SMS Message Templates
Edit the SMS messages in these nodes:
- **Send SMS Confirmation**
- **Send 24h Reminder SMS** 
- **Send 2h Reminder SMS**

Example customizations:
```
Hi {{ $json.customer.firstName }}! 💅 

Your {{ $json.service.name }} appointment is confirmed for:
📅 {{ $json.appointment.date }} at {{ $json.appointment.time }}

Location: {{ $json.business.name }}
{{ $json.business.address }}

Questions? Call {{ $json.business.phone }}

Reply STOP to opt out.
```

### 4.2 Email Template Customization
The **"Send Email Confirmation"** node contains a full HTML email template. You can customize:
- **Colors** - Change the gradient colors in the header
- **Branding** - Add your salon's logo
- **Content** - Modify the messaging and layout
- **Call-to-actions** - Update button links and text

### 4.3 Calendar Event Details
In the **"Add to Google Calendar"** node, customize:
- **Event title format**
- **Event description**
- **Default calendar** (can be business-specific)
- **Attendee notifications**

### 4.4 Business Hours Validation
You may want to add a condition node to check if it's business hours before sending certain notifications.

## ⏰ Step 5: Configure Reminders (Optional)

### 5.1 Enable Reminder Nodes
The reminder nodes are **disabled** by default. To enable them:

1. **24-Hour Reminder Path:**
   - Click **"Wait 24 Hours"** node → **Enable**
   - Click **"Send 24h Reminder SMS"** node → **Enable**

2. **2-Hour Reminder Path:**
   - Click **"Wait 2 More Hours"** node → **Enable** 
   - Click **"Send 2h Reminder SMS"** node → **Enable**

### 5.2 Adjust Timing
- **24-Hour Reminder:** Currently set to 86400 seconds (24 hours)
- **2-Hour Reminder:** Currently set to 7200 seconds (2 hours)

You can modify these values in the **Wait** nodes.

### 5.3 Smart Reminder Logic
Consider adding conditions for:
- **Business hours only** (don't send reminders at 3 AM)
- **Customer preferences** (opt-out of reminders)
- **Appointment type** (different timing for different services)

## 🧪 Step 6: Test the Workflow

### 6.1 Test Booking Flow
1. Make a test appointment via your AI assistant
2. Check N8N execution log for the workflow run
3. Verify you receive:
   - SMS confirmation
   - Email confirmation  
   - Calendar event created

### 6.2 Debug Common Issues

**Webhook Not Triggering:**
- Check N8N_WEBHOOK_URL environment variable
- Verify webhook URL is accessible
- Check webhook server logs for errors

**SMS Not Sending:**
- Verify Twilio credentials are correct
- Check Twilio phone number is SMS-enabled
- Ensure customer phone number is valid format

**Email Not Sending:**
- Check Gmail OAuth2 credentials
- Verify Gmail API is enabled
- Check spam folder

**Calendar Not Working:**
- Verify Google Calendar API credentials
- Check calendar permissions
- Ensure customer email is valid

## 📊 Step 7: Monitor and Optimize

### 7.1 N8N Execution Monitoring
- Monitor workflow execution success rates
- Check error logs for failed automations
- Set up notifications for workflow failures

### 7.2 Customer Feedback
- Track SMS opt-out rates
- Monitor email open/click rates
- Survey customers about communication preferences

### 7.3 Analytics Integration
The workflow automatically logs events to your analytics system. Use this data to:
- Track automation effectiveness
- Optimize message timing
- Improve customer experience

## 🔄 Step 8: Advanced Features

### 8.1 Conditional Logic
Add **IF** nodes for:
- First-time vs returning customers
- Service-specific messaging
- Seasonal promotions
- VIP customer treatments

### 8.2 Multiple Business Support
For multi-tenant setups:
- Use business ID to route to correct calendars
- Customize messaging per business
- Use business-specific credentials

### 8.3 Integration Expansions
Consider adding:
- **Square/Stripe** payment confirmations
- **Social media** check-in prompts
- **Review requests** post-appointment
- **Loyalty points** notifications
- **Birthday/anniversary** campaigns

## 🚨 Important Notes

### Security Best Practices
- Never expose credentials in workflow configurations
- Use environment variables for sensitive data
- Regularly rotate API keys
- Monitor webhook endpoint access

### Rate Limiting
- Twilio has SMS sending limits
- Gmail has daily send limits
- Google Calendar has API rate limits
- Build in error handling and retry logic

### Data Privacy
- Follow SMS marketing compliance (TCPA)
- Respect email marketing laws (CAN-SPAM)
- Provide clear opt-out mechanisms
- Handle customer data responsibly

## 📞 Support

If you need help with setup:
1. Check N8N documentation and community forums
2. Review webhook server logs for debugging
3. Test individual workflow nodes
4. Contact your technical support team

---

## 📋 Quick Setup Checklist

- [ ] N8N workflow imported
- [ ] Twilio credentials configured
- [ ] Gmail credentials configured  
- [ ] Google Calendar credentials configured
- [ ] Supabase database credentials configured
- [ ] N8N_WEBHOOK_URL environment variable added
- [ ] Railway deployment updated
- [ ] Test booking completed successfully
- [ ] SMS confirmation received
- [ ] Email confirmation received
- [ ] Calendar event created
- [ ] Workflow is active and monitoring

**🎉 Congratulations!** Your post-booking automation is now live and will enhance your customer experience while reducing manual work.

---

*This workflow integrates seamlessly with your existing Voice AI booking system and provides a professional, automated customer experience that builds trust and reduces no-shows.*