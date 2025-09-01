# 👨‍💻 **DEVELOPER #1: BACKEND & INTEGRATIONS SPECIALIST**
## **MISSION: Complete Payment, SMS, and Email Backend Systems**

---

## 🎯 **YOUR SPECIALIZATION**
**Focus:** Server-side logic, APIs, external service integrations, database operations
**Timeline:** 2 weeks to 100% feature completion
**Success Metric:** All backend systems functional and tested

---

## 📂 **PROJECT STRUCTURE - WHERE TO FIND EVERYTHING**

### **🏠 Base Directory:**
```
C:\Users\escot\vapi-nail-salon-agent\dashboard\
```

### **📁 Key Reference Files (READ THESE FIRST):**
```
📖 FEATURE_GAP_ANALYSIS.md           - What we need to build
📖 3_DEVELOPER_TEAM_STRATEGY.md      - Overall team strategy  
📖 .env.local                        - Environment variables
📖 lib/supabase.ts                   - Database client (you'll extend this)
📖 lib/supabase-types-mvp.ts         - Type definitions (you'll add to this)
```

### **🔍 Existing Code to Study:**
```
📂 app/api/book-appointment/route.ts  - Example API structure
📂 app/api/check-availability/route.ts - Another API example
📂 components/SocialMediaKit.tsx      - Shows QR code generation pattern
📂 app/api/setup-test-data/route.ts   - Database operations example
```

---

## ⚡ **WEEK 1 TASKS - CRITICAL INTEGRATIONS**

### 🏆 **TASK 1: PAYMENT PROCESSING INTEGRATION** 
**Priority:** CRITICAL ⚡ **Deadline:** Day 3

#### **Files to Create:**
```
📁 lib/stripe-service.ts           - Stripe integration service
📁 lib/square-service.ts           - Square integration service  
📁 app/api/process-payment/route.ts - Payment processing endpoint
📁 app/api/webhook/stripe/route.ts  - Stripe webhook handler
📁 app/api/webhook/square/route.ts  - Square webhook handler
```

#### **Implementation Guide:**

**Step 1.1: Create Stripe Service**
```typescript
// lib/stripe-service.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export class StripeService {
  static async processPayment(
    amount: number, // in cents
    customerId: string,
    appointmentId: string,
    businessId: string
  ) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        metadata: {
          customerId,
          appointmentId,
          businessId
        }
      })
      
      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    } catch (error: any) {
      console.error('Stripe payment error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  static async confirmPayment(paymentIntentId: string) {
    // Implementation for payment confirmation
  }

  static async refundPayment(paymentIntentId: string, amount?: number) {
    // Implementation for refunds
  }
}
```

**Step 1.2: Create Payment API Endpoint**
```typescript
// app/api/process-payment/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { StripeService } from '../../../lib/stripe-service'
import { SquareService } from '../../../lib/square-service'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { 
      processor, // 'stripe' or 'square'
      amount, 
      customerId, 
      appointmentId, 
      businessId,
      paymentMethod 
    } = await request.json()

    let result
    if (processor === 'stripe') {
      result = await StripeService.processPayment(amount, customerId, appointmentId, businessId)
    } else if (processor === 'square') {
      result = await SquareService.processPayment(amount, customerId, appointmentId, businessId)
    } else {
      throw new Error('Invalid payment processor')
    }

    if (result.success) {
      // Record payment in database
      const { data: payment, error } = await supabase
        .from('payments')
        .insert({
          business_id: businessId,
          customer_id: customerId,
          appointment_id: appointmentId,
          total_amount: amount,
          processor_type: processor,
          transaction_id: result.paymentIntentId || result.transactionId,
          status: 'processing',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({
        success: true,
        paymentId: payment.id,
        clientSecret: result.clientSecret,
        message: 'Payment initiated successfully'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 })
    }

  } catch (error: any) {
    console.error('Payment processing error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
```

#### **Environment Variables Needed:**
```bash
# Add to .env.local
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
SQUARE_ACCESS_TOKEN=sandbox-sq0...
SQUARE_LOCATION_ID=your-location-id
```

#### **Testing Your Implementation:**
```bash
# Test payment processing
curl -X POST http://localhost:3006/api/process-payment \
  -H "Content-Type: application/json" \
  -d '{
    "processor": "stripe",
    "amount": 5000,
    "customerId": "test-customer",
    "appointmentId": "test-appointment", 
    "businessId": "8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad"
  }'
```

---

### 🏆 **TASK 2: SMS SYSTEM ACTIVATION**
**Priority:** CRITICAL ⚡ **Deadline:** Day 2

#### **Files to Create/Update:**
```
📁 lib/twilio-service.ts              - SMS service (update existing)
📁 app/api/send-sms/route.ts          - SMS sending endpoint
📁 lib/sms-templates.ts               - SMS message templates
```

#### **Implementation Guide:**

**Step 2.1: Update Twilio Service**
```typescript
// lib/twilio-service.ts
import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export class TwilioService {
  static async sendSMS(to: string, message: string) {
    try {
      const result = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to
      })
      
      return {
        success: true,
        messageId: result.sid,
        status: result.status
      }
    } catch (error: any) {
      console.error('SMS sending error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  static async sendAppointmentConfirmation(
    customerPhone: string, 
    businessName: string, 
    appointmentDate: string, 
    appointmentTime: string,
    serviceName: string
  ) {
    const message = `✨ Appointment Confirmed!

${businessName}
📅 ${appointmentDate} at ${appointmentTime}
💅 ${serviceName}

Reply CANCEL to cancel or call us with questions.`

    return await this.sendSMS(customerPhone, message)
  }

  static async sendAppointmentReminder(
    customerPhone: string,
    businessName: string,
    appointmentDate: string,
    appointmentTime: string
  ) {
    const message = `⏰ Reminder: Your appointment at ${businessName} is tomorrow at ${appointmentTime}. 

See you then! 💅✨`

    return await this.sendSMS(customerPhone, message)
  }
}
```

#### **Environment Variables Needed:**
```bash
# Add to .env.local (REPLACE the placeholder values)
TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcdef
TWILIO_AUTH_TOKEN=your_auth_token_here  
TWILIO_PHONE_NUMBER=+14243519304
```

#### **Testing Your Implementation:**
```bash
# Test SMS sending
curl -X POST http://localhost:3006/api/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "5551234567",
    "message": "Test SMS from nail salon booking system!"
  }'
```

---

### 🏆 **TASK 3: EMAIL MARKETING BACKEND**
**Priority:** HIGH 📧 **Deadline:** Day 5

#### **Files to Create:**
```
📁 lib/email-marketing.ts            - Email service
📁 lib/sendgrid-service.ts           - SendGrid integration
📁 app/api/email/campaign/route.ts   - Campaign creation
📁 app/api/email/send/route.ts       - Email sending
📁 lib/email-templates.ts            - Email templates
```

#### **Implementation Guide:**

**Step 3.1: Create Email Marketing Service**
```typescript
// lib/email-marketing.ts
import { SendGridService } from './sendgrid-service'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export class EmailMarketingService {
  static async sendWelcomeEmail(customerEmail: string, businessName: string) {
    const template = `
    <h2>Welcome to ${businessName}!</h2>
    <p>Thank you for booking with us. We can't wait to pamper you!</p>
    <p>Manage your appointments anytime at: <a href="${process.env.NEXT_PUBLIC_BASE_URL}/customer/login">Customer Portal</a></p>
    `
    
    return await SendGridService.sendEmail(
      customerEmail,
      `Welcome to ${businessName}!`,
      template
    )
  }

  static async createCampaign(businessId: string, campaignData: {
    name: string
    subject: string
    content: string
    targetSegment: string
  }) {
    // Store campaign in database
    const { data: campaign, error } = await supabase
      .from('email_campaigns')
      .insert({
        business_id: businessId,
        name: campaignData.name,
        subject: campaignData.subject,
        content: campaignData.content,
        target_segment: campaignData.targetSegment,
        status: 'draft',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return campaign
  }

  static async sendCampaign(campaignId: string) {
    // Get campaign details
    // Get target customers
    // Send emails
    // Track results
  }
}
```

#### **Environment Variables Needed:**
```bash
# Add to .env.local
SENDGRID_API_KEY=SG.your-api-key-here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Your Salon Name
```

---

## ⚡ **WEEK 2 TASKS - ADVANCED SYSTEMS**

### 🏆 **TASK 4: PLAN ENFORCEMENT MIDDLEWARE**
**Priority:** HIGH 🔒 **Deadline:** Day 8

#### **Files to Create:**
```
📁 lib/plan-enforcement.ts           - Core enforcement logic
📁 lib/plan-limits.ts                - Plan limits configuration  
📁 middleware/plan-check.ts          - Request middleware
📁 app/api/check-plan-limits/route.ts - Plan validation endpoint
```

#### **Implementation Guide:**
```typescript
// lib/plan-limits.ts
export const PLAN_LIMITS = {
  starter: {
    locations: 1,
    staff: 5,
    monthly_appointments: 1000,
    features: ['voice_booking', 'web_booking', 'sms_notifications']
  },
  professional: {
    locations: 1,
    staff: 10, 
    monthly_appointments: 5000,
    features: ['voice_booking', 'web_booking', 'sms_notifications', 'email_marketing', 'payments', 'loyalty']
  },
  business: {
    locations: 3,
    staff: 50,
    monthly_appointments: 'unlimited',
    features: ['voice_booking', 'web_booking', 'sms_notifications', 'email_marketing', 'payments', 'loyalty', 'integrations', 'white_label']
  }
}

export const enforcePlanLimit = async (businessId: string, resource: string, action: string) => {
  // Check if business can perform action based on their plan
  // Return { allowed: boolean, reason?: string, upgradeRequired?: string }
}
```

### 🏆 **TASK 5: INTEGRATION FRAMEWORK**
**Priority:** MEDIUM 🔌 **Deadline:** Day 10

#### **Files to Create:**
```
📁 lib/integration-manager.ts        - Integration management
📁 app/api/webhooks/create/route.ts  - Webhook creation
📁 app/api/webhooks/test/route.ts    - Webhook testing
📁 app/api/integrations/list/route.ts - Available integrations
```

---

## 🧪 **TESTING REQUIREMENTS**

### **Daily Testing Checklist:**
```bash
# Run these tests every day before standup:

# 1. Payment System Test
npm run test:payments

# 2. SMS System Test  
npm run test:sms

# 3. Email System Test
npm run test:email

# 4. Database Integration Test
npm run test:database

# 5. API Endpoint Tests
npm run test:api
```

### **Create Test Files:**
```
📁 tests/payment-integration.test.js
📁 tests/sms-system.test.js  
📁 tests/email-marketing.test.js
📁 tests/plan-enforcement.test.js
```

---

## 📊 **DAILY PROGRESS REPORTING**

### **End of Day Report Format:**
```markdown
## Developer #1 - Day X Progress Report

### ✅ Completed Today:
- [x] Stripe integration basic setup
- [x] Payment API endpoint created
- [x] SMS service updated with real credentials

### 🔄 In Progress:
- [ ] Square integration (80% complete)
- [ ] Email marketing backend (50% complete)

### 🚨 Blockers:
- Need staging environment for payment testing
- Waiting for SendGrid account approval

### 📅 Tomorrow's Priority:
- Complete Square integration testing
- Begin email campaign creation API
- Test payment webhook handling

### 🧪 Test Results:
- Payment processing: ✅ PASS
- SMS sending: ✅ PASS  
- Database operations: ✅ PASS
- API endpoints: ✅ PASS
```

---

## 🆘 **SUPPORT & COORDINATION**

### **Daily Standup (Every Morning):**
- **Time:** [TO BE SCHEDULED]
- **Format:** 15 minutes max
- **Your Report:** "Yesterday I completed X, today I'm working on Y, blockers: Z"

### **Getting Help:**
- **Technical Questions:** Ask Claude (coordination role)
- **Frontend Integration:** Coordinate with Developer #2
- **Urgent Issues:** Immediate Slack message to team

### **Code Review Process:**
1. Create feature branch: `feature/payment-integration`
2. Complete implementation
3. Create Pull Request
4. Claude reviews for integration issues
5. Developer #2 reviews for interface compatibility
6. Merge after approval

### **Shared Resources:**
- **Types:** Update `lib/supabase-types-mvp.ts` when adding new types
- **Database:** Coordinate schema changes through Claude
- **Environment:** Never commit `.env.local` to git

---

## 🎯 **SUCCESS CRITERIA**

### **Week 1 Goals:**
- [ ] Stripe OR Square payments processing successfully
- [ ] SMS confirmations sending automatically for all bookings
- [ ] Email marketing backend API functional
- [ ] All APIs documented and tested
- [ ] Payment webhook handling working

### **Week 2 Goals:**
- [ ] Plan enforcement preventing unauthorized feature access
- [ ] Integration framework supporting webhooks
- [ ] Email campaigns can be created and sent
- [ ] All backend systems fully tested
- [ ] Production deployment ready

### **Quality Standards:**
- All APIs return consistent response formats
- Error handling with proper HTTP status codes
- Comprehensive logging for debugging
- Input validation on all endpoints
- Rate limiting implemented where appropriate

---

## 🚀 **READY TO START?**

1. **Read the reference files** in the project directory
2. **Set up your development environment** with the required API keys
3. **Create your feature branch:** `git checkout -b feature/backend-integrations`
4. **Start with Task 1 (Payment Processing)** - it's the highest priority
5. **Report to standup tomorrow morning** with your progress

**Remember:** You're the backend specialist - focus on making all the server-side magic work perfectly. Developer #2 will handle the UI components that use your APIs.

**Let's build something amazing! 💪**