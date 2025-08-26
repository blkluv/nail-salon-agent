# Voice AI Troubleshooting Guide - Technical Issues

## 📋 ERROR LOG SYSTEM (NEW!)

### Before Troubleshooting - Check Error Logs First!

🔍 **ALWAYS check these error log files before starting troubleshooting**:

1. **`RAILWAY_502_ERROR_LOG.md`** - Railway deployment 502 Bad Gateway errors
2. **`SMS_INTEGRATION_ERROR_LOG.md`** - Twilio SMS delivery issues (create when needed)
3. **`DATABASE_ERROR_LOG.md`** - Supabase connection problems (create when needed)
4. **`VAPI_API_ERROR_LOG.md`** - Voice AI service issues (create when needed)

### How to Use Error Logs
1. **Find relevant log** for your error type
2. **Check "Attempts Made"** section - don't repeat failed solutions
3. **Follow "Next Steps"** from the log
4. **Update log** with new findings and attempts
5. **Mark resolved** when fixed

### When to Create New Error Logs
- **Recurring issues** that waste troubleshooting time
- **Complex errors** requiring multiple solution attempts
- **Service-specific problems** (Railway, Twilio, Supabase, etc.)

---

## 🚨 Quick Reference Emergency Actions

| Problem | Immediate Action | Next Steps |
|---|---|---|
| AI system completely down | Switch to manual booking | Contact technical support |
| Customers can't get through | Check phone forwarding | Test call yourself |
| Wrong appointments being booked | Note patterns, continue manually | Review AI configuration |
| Customer complaints about AI | Apologize, fix manually | Document and report |

---

## 📞 Phone System Issues

### Issue: Customers Can't Reach the AI

**Symptoms:**
- Phone rings but no AI picks up
- Goes straight to voicemail
- "Number disconnected" message
- Call doesn't connect at all

**Diagnostic Steps:**
1. **Test the number yourself**: Call (424) 351-9304
2. **Check during/outside business hours**: AI should work 24/7
3. **Try from different phones**: Cell phone, landline, different carriers
4. **Check Vapi dashboard**: Look for system status indicators

**Solutions:**
```bash
# Check webhook server status
curl -X GET https://vapi-nail-salon-agent-production.up.railway.app/health

# Should return: {"status":"healthy","timestamp":"..."}
```

**If server is down:**
1. Restart Railway deployment
2. Check Railway logs for errors
3. Verify environment variables are set
4. Contact hosting provider if needed

### Issue: AI Answers But Doesn't Function Properly

**Symptoms:**
- AI says "hello" but then goes silent
- AI repeats itself
- AI says it can't help with bookings
- AI gives wrong information

**Diagnostic Steps:**
1. **Check webhook logs**: Look for errors in Railway dashboard
2. **Test database connection**: Verify Supabase is accessible
3. **Check AI configuration**: Ensure functions are properly set up in Vapi

**Solutions:**
```javascript
// Test database connection
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// Test query
const { data, error } = await supabase
    .from('appointments')
    .select('count')
    .limit(1);

console.log('Database test:', error ? 'FAILED' : 'SUCCESS');
```

---

## 🗄️ Database Issues

### Issue: AI Can't Check Availability

**Symptoms:**
- AI says "I can't check availability right now"
- AI books appointments at closed times
- AI double-books appointments

**Diagnostic Steps:**
1. **Check business hours table**: Verify hours are set correctly
2. **Check appointments table**: Look for data corruption
3. **Verify database schema**: Ensure all required tables exist

**Database Queries to Run:**
```sql
-- Check if business hours are set
SELECT * FROM business_hours 
WHERE business_id = '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad';

-- Check recent appointments
SELECT * FROM appointments 
WHERE business_id = '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad'
ORDER BY created_at DESC 
LIMIT 10;

-- Check for double bookings
SELECT appointment_date, start_time, COUNT(*) as count
FROM appointments 
WHERE business_id = '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad'
  AND status = 'scheduled'
GROUP BY appointment_date, start_time
HAVING COUNT(*) > 1;
```

**Solutions:**
- **Missing business hours**: Add hours for all days of week
- **Corrupt data**: Clean up duplicate or invalid appointments
- **Schema issues**: Run database migration scripts

### Issue: Appointments Not Saving

**Symptoms:**
- Customer says AI confirmed booking
- No appointment appears in system
- AI says booking was successful but nothing in database

**Check These:**
```sql
-- Look for failed bookings (might be in different status)
SELECT * FROM appointments 
WHERE customer_phone LIKE '%[phone_number]%'
ORDER BY created_at DESC;

-- Check for booking attempts with errors
SELECT * FROM booking_logs 
WHERE error IS NOT NULL
ORDER BY created_at DESC
LIMIT 20;
```

**Common Causes:**
- Database permissions issue
- Required fields missing
- Service ID not found
- Customer validation failed

---

## 🤖 Vapi Configuration Issues

### Issue: AI Doesn't Understand Customers

**Symptoms:**
- AI asks customers to repeat themselves frequently
- AI doesn't recognize service names
- AI books wrong services

**Check Vapi Settings:**
1. **Go to Vapi Dashboard** > Your Assistant
2. **Check Voice Model**: Should be set to high-quality option
3. **Review Function Definitions**: Ensure all functions are properly defined
4. **Test Transcription**: Check if voice-to-text is working correctly

**Function Configuration Check:**
```javascript
// Verify these functions exist in Vapi:
- check_availability
- book_appointment  
- check_appointments
- cancel_appointment
```

### Issue: AI Transfers Every Call

**Symptoms:**
- AI immediately says "let me transfer you"
- AI doesn't attempt to book appointments
- All calls end up with human staff

**Possible Causes:**
- Transfer conditions are too broad
- AI confidence threshold is too low
- Function calls are failing (so AI gives up)

**Check webhook logs for:**
```
Error: Unknown function: book_appointment
Error: Function timeout
Error: Invalid parameters
```

---

## 📱 SMS Integration Issues

### Issue: Customers Not Receiving Confirmations

**Symptoms:**
- AI books appointment successfully
- Customer doesn't receive SMS confirmation
- SMS sending fails in logs

**Check These:**
```bash
# Test Twilio credentials
curl -X POST https://api.twilio.com/2010-04-01/Accounts/[ACCOUNT_SID]/Messages.json \
  -d "Body=Test message" \
  -d "From=+14243519304" \
  -d "To=+1234567890" \
  -u [ACCOUNT_SID]:[AUTH_TOKEN]
```

**Environment Variables Check:**
```env
TWILIO_ACCOUNT_SID=AC... (should start with AC)
TWILIO_AUTH_TOKEN=... (32 character string)
TWILIO_PHONE_NUMBER=+14243519304
```

**Common Issues:**
- Account SID or Auth Token incorrect
- Phone number not verified in Twilio
- Customer phone number format wrong
- Twilio account out of credits

### Issue: SMS Webhook Not Working

**Symptoms:**
- Customers text the number but get no response
- "CANCEL" texts don't cancel appointments
- No SMS interactions logged

**Test SMS Webhook:**
```bash
curl -X POST https://vapi-nail-salon-agent-production.up.railway.app/webhook/sms \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "Body=test&From=%2B1234567890&To=%2B14243519304"
```

**Check Twilio Console:**
1. Go to Phone Numbers > Manage > Active Numbers
2. Click on +14243519304
3. Verify webhook URL is set correctly
4. Check message logs for delivery status

---

## 🔧 Railway Deployment Issues

### Issue: Server Keeps Crashing

**Check Railway Logs:**
1. Go to Railway dashboard
2. Click on your project
3. Go to "Deployments" tab
4. Click "View Logs"

**Common Error Patterns:**
```
Error: listen EADDRINUSE :::3001
- Solution: Change PORT variable or restart deployment

Error: Connection to database failed
- Solution: Check SUPABASE_URL and SUPABASE_SERVICE_KEY

Error: Cannot find module
- Solution: Check package.json dependencies

OutOfMemoryError
- Solution: Upgrade Railway plan or optimize code
```

### Issue: Environment Variables Not Working

**Check Variables:**
1. Railway dashboard > Project > Variables
2. Verify all required variables are set:
   ```
   SUPABASE_URL
   SUPABASE_SERVICE_KEY  
   TWILIO_ACCOUNT_SID
   TWILIO_AUTH_TOKEN
   TWILIO_PHONE_NUMBER
   ```

**Test Environment Variables:**
```javascript
console.log('Environment check:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'MISSING');
console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? 'SET' : 'MISSING');
```

---

## 🕒 Performance Issues

### Issue: AI Response is Too Slow

**Symptoms:**
- Long pauses before AI responds
- Customers hang up waiting for AI
- Timeouts in webhook logs

**Diagnostic:**
1. **Check webhook response times**: Should be under 5 seconds
2. **Monitor database query performance**: Slow queries cause delays
3. **Check Railway resource usage**: CPU/memory limits

**Optimization:**
```javascript
// Add indexes to frequently queried columns
CREATE INDEX idx_appointments_date_business ON appointments(appointment_date, business_id);
CREATE INDEX idx_business_hours_day_business ON business_hours(day_of_week, business_id);

// Cache business hours instead of querying every time
const businessHoursCache = new Map();
```

### Issue: High Number of Failed Bookings

**Check Success Rate:**
```sql
-- Calculate booking success rate
SELECT 
    COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as successful,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
    COUNT(*) as total,
    ROUND(COUNT(CASE WHEN status = 'scheduled' THEN 1 END) * 100.0 / COUNT(*), 2) as success_rate
FROM appointments
WHERE created_at >= NOW() - INTERVAL '7 days';
```

**Common Failure Causes:**
- Requested time not available
- Service not found in database
- Invalid customer data format
- Database connection issues

---

## 📞 Testing Procedures

### Complete System Test

**1. End-to-End Test:**
```
Call (424) 351-9304 → Book appointment → Check database → Verify SMS
```

**2. Database Test:**
```bash
node scripts/test-database.js
```

**3. SMS Test:**
```bash
# Send test SMS
curl -X POST [webhook-url]/webhook/sms -d "Body=book&From=+1234567890"
```

**4. Webhook Test:**
```bash
# Test all webhook endpoints
curl [webhook-url]/health
curl -X POST [webhook-url]/webhook/vapi -H "Content-Type: application/json" -d '{"test":true}'
```

### Monthly Health Check

- [ ] Test AI booking from customer perspective
- [ ] Verify SMS confirmations working
- [ ] Check database for booking accuracy
- [ ] Review error logs for patterns
- [ ] Test backup/manual booking procedures
- [ ] Verify all staff know troubleshooting basics

---

## 🆘 Emergency Procedures

### If AI System Completely Fails

**Immediate Actions (5 minutes):**
1. **Put up notice**: "Booking by phone temporarily unavailable"
2. **Switch to manual**: Take all bookings manually
3. **Call forwarding**: Forward AI number to salon if possible
4. **Staff notification**: Inform all staff of manual booking mode

**Communication with Customers:**
- "Our AI booking system is temporarily down for maintenance"
- "I can book your appointment right now manually"
- "Everything will be back to normal soon"
- "Your appointment will be exactly the same"

**Recovery Steps:**
1. Identify root cause using this guide
2. Implement fix
3. Test thoroughly before re-enabling
4. Notify customers system is restored
5. Monitor closely for 24 hours

### If Database Issues

**Backup Plan:**
1. Use manual appointment book
2. Take customer info on paper
3. Input to system when restored
4. Double-check no conflicts created

---

## 📊 Monitoring Dashboard

### Key Metrics to Watch

**Daily:**
- Successful bookings vs attempts
- Average call duration
- Customer hang-up rate
- SMS delivery success rate

**Weekly:**  
- Error patterns in logs
- Database query performance
- System uptime percentage
- Customer feedback trends

**Monthly:**
- Total bookings via AI vs manual
- Revenue from AI bookings
- Customer satisfaction scores
- System reliability report

---

## 📞 Support Contacts

| Issue Type | Contact | Response Time |
|---|---|---|
| System Down | [Emergency Tech Support] | 15 minutes |
| Database Issues | [Database Admin] | 30 minutes |
| Vapi Problems | [Vapi Support] | 1 hour |
| SMS/Twilio Issues | [Communications Support] | 1 hour |
| General Questions | [Tech Team Lead] | 4 hours |

---

## ✅ Troubleshooting Checklist

When issue reported:
- [ ] Reproduce the issue
- [ ] Check system status (health endpoints)
- [ ] Review error logs (last 1 hour)
- [ ] Test basic functionality
- [ ] Check environment variables
- [ ] Verify database connectivity
- [ ] Test from customer perspective
- [ ] Document findings
- [ ] Implement fix
- [ ] Test fix thoroughly
- [ ] Monitor for recurrence
- [ ] Update this guide if needed

---

Remember: **When in doubt, switch to manual booking and contact support immediately. Customer service comes first!**