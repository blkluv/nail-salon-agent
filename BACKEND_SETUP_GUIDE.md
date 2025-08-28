# Backend Implementation Setup Guide

## 🎯 Overview
This guide will help you deploy the complete backend implementation for:
1. **Customer Self-Service Portal** - Phone-based authentication + customer dashboard
2. **Smart Analytics Dashboard** - AI-powered insights and reporting

## 📋 Setup Checklist

### 1. Database Schema Updates
- [ ] Run the SQL script in Supabase SQL editor: `database-schema-updates.sql`
- [ ] Verify all tables were created successfully
- [ ] Check that indexes were created for performance

### 2. Environment Variables
- [ ] Copy `.env.example` to `.env`
- [ ] Update all environment variables with your actual values:
  - `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
  - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
  - `CUSTOMER_JWT_SECRET` (generate a secure 64+ character string)
  - `VAPI_API_KEY` and `ASSISTANT_ID`

### 3. Dependencies Installation
- [ ] Run: `npm install`
- [ ] Verify all packages installed correctly

### 4. Local Testing
- [ ] Start server: `npm start` or `node webhook-server.js`
- [ ] Check health endpoint: `GET http://localhost:3001/health`
- [ ] Test customer auth: `POST http://localhost:3001/api/customer/auth/send-verification`
- [ ] Test analytics: `GET http://localhost:3001/api/analytics/dashboard/YOUR_BUSINESS_ID`

### 5. Railway Deployment
- [ ] Push changes to your Git repository
- [ ] Update environment variables in Railway dashboard
- [ ] Deploy and test production endpoints

## 🔑 Environment Variables Setup

### Required Variables
```bash
# Generate a secure JWT secret (64+ characters)
CUSTOMER_JWT_SECRET="your_super_secure_random_string_here_make_it_at_least_64_characters_long"

# Your Twilio credentials
TWILIO_ACCOUNT_SID="ACxxxxxxxxx"
TWILIO_AUTH_TOKEN="xxxxxxxxx"
TWILIO_PHONE_NUMBER="+1234567890"

# Existing Supabase and Vapi configs
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 🧪 API Testing Commands

### Customer Authentication
```bash
# Send verification code
curl -X POST http://localhost:3001/api/customer/auth/send-verification \
  -H "Content-Type: application/json" \
  -d '{"businessId":"8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad","phoneNumber":"5551234567"}'

# Verify code (use the code from your SMS or console output)
curl -X POST http://localhost:3001/api/customer/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{"businessId":"8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad","phoneNumber":"5551234567","code":"123456"}'
```

### Analytics Dashboard
```bash
# Get dashboard analytics
curl -X GET "http://localhost:3001/api/analytics/dashboard/8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad?dateRange=month"

# Get booking trends
curl -X GET "http://localhost:3001/api/analytics/trends/8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad?days=30"
```

### Customer Portal (requires session token from verification)
```bash
# Get customer appointments (replace SESSION_TOKEN with actual token)
curl -X GET "http://localhost:3001/api/customer/portal/appointments" \
  -H "Authorization: Bearer SESSION_TOKEN"

# Update customer profile
curl -X PUT "http://localhost:3001/api/customer/portal/profile" \
  -H "Authorization: Bearer SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"first_name":"John","last_name":"Doe","email":"john@example.com"}'
```

## 🚀 Features Implemented

### Customer Self-Service Portal
- ✅ SMS-based phone number verification
- ✅ Secure session management with JWT tokens
- ✅ Customer profile management
- ✅ View appointments (past and upcoming)
- ✅ Reschedule appointments
- ✅ Cancel appointments
- ✅ Update communication preferences
- ✅ Activity logging and analytics tracking

### Smart Analytics Dashboard
- ✅ Real-time metrics (daily appointments, monthly revenue)
- ✅ Customer insights (retention rates, top customers, lifetime value)
- ✅ Service performance analytics
- ✅ Staff performance tracking
- ✅ Booking trends and patterns
- ✅ AI-powered business insights with recommendations
- ✅ Data export capabilities (JSON/CSV)
- ✅ Feature access control based on subscription tiers

### Security & Performance
- ✅ Rate limiting on authentication endpoints
- ✅ Input validation and sanitization
- ✅ SQL injection protection via Supabase
- ✅ Session expiration and management
- ✅ Database indexes for optimal query performance
- ✅ Error handling and logging
- ✅ CORS configuration for web access

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Customer     │◄──►│   (Node.js      │◄──►│   (Supabase     │
│    Portal)      │    │    Express)     │    │    PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   External      │
                       │   Services      │
                       │   (Twilio SMS)  │
                       └─────────────────┘
```

## 📊 Database Schema

### New Tables Created
1. `customer_verification_codes` - SMS verification codes
2. `customer_sessions` - Customer portal sessions
3. `analytics_events` - Detailed analytics tracking
4. `customer_portal_activities` - Customer activity logs
5. `business_phone_numbers` - Multi-tenant SMS configuration

### Enhanced Tables
- `customers` table enhanced with portal preferences and verification status

## 🔍 Troubleshooting

### Common Issues
1. **SMS not sending**: Check Twilio credentials and phone number format
2. **Database errors**: Ensure all SQL schema updates were applied
3. **Authentication failures**: Verify JWT secret is set correctly
4. **Rate limiting**: Wait for rate limit window to reset (15 minutes)

### Logs to Check
- Server console for error messages
- Supabase logs for database query issues
- Twilio dashboard for SMS delivery status

## 📞 Support

If you encounter issues:
1. Check the server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure database schema was updated successfully
4. Test with the provided curl commands

## 🔄 Next Steps

After deployment, consider:
1. Setting up monitoring and alerts
2. Implementing additional security measures
3. Adding more analytics insights
4. Building the frontend customer portal
5. Creating admin dashboard for business management

---

✅ **Your backend is now ready for Customer Self-Service Portal and Smart Analytics!**