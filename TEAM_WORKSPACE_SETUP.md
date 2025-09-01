# 🏗️ **TEAM WORKSPACE SETUP: Shared Resources & Environment**

## 🎯 **SHARED DEVELOPMENT ENVIRONMENT**

### **📂 Project Structure Overview**
```
vapi-nail-salon-agent/
├── dashboard/                          # Main Next.js application
│   ├── app/                           # Next.js 13+ app directory
│   ├── components/                    # Shared React components
│   ├── lib/                          # Shared utilities and services
│   └── tests/                        # Test files (to be created)
├── docs/                             # Team documentation
├── FEATURE_GAP_ANALYSIS.md           # What we need to build
├── IMPLEMENTATION_ROADMAP.md         # Priority roadmap
├── 3_DEVELOPER_TEAM_STRATEGY.md      # Overall team strategy
├── DEV1_BACKEND_INSTRUCTIONS.md      # Backend developer guide
├── DEV2_FRONTEND_INSTRUCTIONS.md     # Frontend developer guide
├── TEAM_COORDINATION_PROTOCOLS.md    # Daily operations guide
└── TEAM_WORKSPACE_SETUP.md           # This file
```

---

## 🛠️ **DEVELOPMENT ENVIRONMENT SETUP**

### **Prerequisites for All Developers**
```bash
# Required Software
- Node.js 18+ 
- npm 9+
- Git
- VS Code (recommended)
- Database GUI tool (optional: Supabase Studio, TablePlus)
```

### **Initial Setup Commands**
```bash
# 1. Navigate to project directory
cd C:\Users\escot\vapi-nail-salon-agent\dashboard

# 2. Install dependencies
npm install

# 3. Copy environment template
copy .env.example .env.local

# 4. Start development server
npm run dev
```

### **Required VS Code Extensions**
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "Prisma.prisma",
    "ms-playwright.playwright"
  ]
}
```

---

## 🔧 **SHARED CONFIGURATION FILES**

### **Environment Variables Template**
```bash
# Copy this to .env.local for each developer
# DO NOT commit .env.local to git!

# Database Configuration
NEXT_PUBLIC_SUPABASE_URL=https://irvyhhkoiyzartmmvbxw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Payment Processing (Dev #1)
STRIPE_SECRET_KEY=sk_test_your-stripe-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key
SQUARE_ACCESS_TOKEN=sandbox-sq0-your-square-token
SQUARE_LOCATION_ID=your-square-location-id

# Communication Services (Dev #1) 
TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcdef
TWILIO_AUTH_TOKEN=your-auth-token-here
TWILIO_PHONE_NUMBER=+14243519304

# Email Marketing (Dev #1)
SENDGRID_API_KEY=SG.your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
MAILCHIMP_API_KEY=your-mailchimp-key-here

# Application Settings
NEXT_PUBLIC_BASE_URL=http://localhost:3006
NODE_ENV=development
```

### **Package.json Scripts**
```json
{
  "scripts": {
    "dev": "next dev -p 3006",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:api": "jest --testPathPattern=api",
    "test:components": "jest --testPathPattern=components",
    "test:integration": "playwright test",
    "typecheck": "tsc --noEmit"
  }
}
```

---

## 📋 **SHARED TYPE DEFINITIONS**

### **Core Types Location**
All shared types are in: `lib/supabase-types-mvp.ts`

**Key Interfaces:**
- `Business` - Business entity
- `Customer` - Customer entity  
- `Appointment` - Booking entity
- `Payment` - Payment transaction
- `LoyaltyProgram` - Loyalty system
- `Location` - Multi-location support

### **API Service Classes**
Located in: `lib/supabase.ts`

**Available Services:**
- `LocationAPI` - Location management
- `PaymentAPI` - Payment processing  
- `LoyaltyAPI` - Loyalty program
- `AppointmentAPI` - Booking system

---

## 🧪 **TESTING INFRASTRUCTURE**

### **Test Directory Structure**
```
tests/
├── api/                              # API endpoint tests
│   ├── payment.test.ts              # Payment API tests
│   ├── sms.test.ts                  # SMS API tests
│   └── email.test.ts                # Email API tests
├── components/                       # React component tests
│   ├── PaymentForm.test.tsx         # Payment form tests
│   ├── LocationCard.test.tsx        # Location card tests
│   └── LoyaltyTier.test.tsx         # Loyalty tier tests
├── integration/                      # End-to-end tests
│   ├── booking-flow.test.ts         # Complete booking flow
│   ├── payment-flow.test.ts         # Payment processing flow
│   └── plan-enforcement.test.ts     # Plan limit tests
└── utils/                           # Test utilities
    ├── test-data.ts                 # Mock data for tests
    ├── test-helpers.ts              # Common test functions
    └── setup.ts                     # Test environment setup
```

### **Mock Data for Development**
```typescript
// tests/utils/test-data.ts
export const MOCK_BUSINESS = {
  id: '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad',
  name: 'Test Nail Salon',
  phone: '+14243519304',
  plan_tier: 'professional'
}

export const MOCK_CUSTOMER = {
  id: 'customer-123',
  phone: '5551234567',
  name: 'Jane Smith',
  email: 'jane@example.com'
}

export const MOCK_APPOINTMENT = {
  id: 'appointment-123',
  business_id: MOCK_BUSINESS.id,
  customer_id: MOCK_CUSTOMER.id,
  date: '2024-12-01',
  time: '14:00',
  service: 'Manicure',
  duration: 60,
  status: 'confirmed'
}
```

---

## 🔒 **SECURITY & ACCESS CONTROL**

### **API Key Management**
- **Never commit API keys** to git
- **Use different keys** for development vs production
- **Rotate keys regularly** (monthly)
- **Store keys securely** in `.env.local` only

### **Database Access**
- **Service Role Key:** Only for server-side operations
- **Anon Key:** For client-side operations (public)
- **Row Level Security:** Enabled on all tables
- **Business Isolation:** All queries filtered by business_id

### **Plan Tier Enforcement**
```typescript
// lib/plan-limits.ts - Shared across all developers
export const PLAN_LIMITS = {
  starter: {
    locations: 1,
    staff: 5,
    monthly_bookings: 1000,
    features: ['voice_booking', 'web_booking', 'sms_notifications']
  },
  professional: {
    locations: 1,
    staff: 15,
    monthly_bookings: 5000,
    features: ['voice_booking', 'web_booking', 'sms_notifications', 'payments', 'loyalty', 'email_marketing']
  },
  business: {
    locations: 3,
    staff: 50,
    monthly_bookings: 'unlimited',
    features: ['all_features', 'integrations', 'priority_support', 'white_label']
  }
}
```

---

## 🎨 **UI/UX DESIGN SYSTEM**

### **Color Palette**
```css
/* Primary Colors */
--purple-600: #9333ea;
--purple-700: #7c3aed;
--pink-600: #db2777;
--pink-700: #be185d;

/* Status Colors */
--green-600: #059669;  /* Success */
--red-600: #dc2626;    /* Error */
--yellow-600: #d97706; /* Warning */
--blue-600: #2563eb;   /* Info */

/* Neutral Colors */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-600: #4b5563;
--gray-900: #111827;
```

### **Component Patterns**
```typescript
// Standard loading state
const [loading, setLoading] = useState(false)

// Standard error handling
const [error, setError] = useState<string | null>(null)

// Standard API call pattern
const handleApiCall = async () => {
  setLoading(true)
  setError(null)
  try {
    const result = await apiFunction()
    // Handle success
  } catch (error: any) {
    setError(error.message)
  } finally {
    setLoading(false)
  }
}
```

### **Responsive Breakpoints**
```css
/* Mobile First Approach */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */ 
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
```

---

## 📊 **MONITORING & DEBUGGING**

### **Development Tools**
- **React DevTools:** Browser extension for React debugging
- **Supabase Studio:** Database management and queries
- **Postman/Insomnia:** API testing and development
- **Browser DevTools:** Network tab for API debugging

### **Logging Standards**
```typescript
// Use consistent logging throughout
console.log('[INFO]', 'User action:', action)
console.warn('[WARN]', 'Validation issue:', issue)  
console.error('[ERROR]', 'API failure:', error)

// For production debugging
const logger = {
  info: (message: string, data?: any) => console.log(`[${new Date().toISOString()}] INFO:`, message, data),
  warn: (message: string, data?: any) => console.warn(`[${new Date().toISOString()}] WARN:`, message, data),
  error: (message: string, data?: any) => console.error(`[${new Date().toISOString()}] ERROR:`, message, data)
}
```

### **Performance Monitoring**
```typescript
// Performance tracking for API calls
const startTime = performance.now()
await apiCall()
const endTime = performance.now()
console.log(`API call took ${endTime - startTime}ms`)
```

---

## 🔄 **DATABASE MANAGEMENT**

### **Schema Changes Protocol**
1. **Discuss with team** before making changes
2. **Create migration scripts** for schema changes  
3. **Update TypeScript types** immediately
4. **Test with existing data**
5. **Document changes** in team chat

### **Common Database Operations**
```sql
-- Check business plan limits
SELECT b.name, b.plan_tier, COUNT(l.id) as location_count 
FROM businesses b 
LEFT JOIN locations l ON b.id = l.business_id 
GROUP BY b.id;

-- Verify payment processing setup
SELECT b.name, b.stripe_account_id, b.square_location_id
FROM businesses b 
WHERE b.plan_tier IN ('professional', 'business');

-- Check loyalty program enrollment  
SELECT b.name, lp.tier_thresholds, COUNT(c.id) as customer_count
FROM businesses b
JOIN loyalty_programs lp ON b.id = lp.business_id
LEFT JOIN customers c ON b.id = c.business_id
GROUP BY b.id;
```

### **Data Backup & Safety**
- **Never run DELETE** without WHERE clause
- **Always test queries** on small datasets first
- **Use transactions** for multi-table operations
- **Keep backups** of important test data

---

## 🚀 **DEPLOYMENT COORDINATION**

### **Staging Environment**
- **URL:** https://staging-vapi-nail-salon.vercel.app (to be created)
- **Database:** Separate staging Supabase instance
- **Purpose:** Test features before production deploy

### **Production Environment**  
- **URL:** https://vapi-nail-salon-agent-production.up.railway.app
- **Database:** Production Supabase instance
- **Deployment:** Automated via Railway for webhook server

### **Feature Flag System**
```typescript
// lib/feature-flags.ts
export const FEATURE_FLAGS = {
  PAYMENT_PROCESSING: process.env.NODE_ENV === 'production',
  EMAIL_MARKETING: process.env.ENABLE_EMAIL === 'true',
  PLAN_ENFORCEMENT: true,
  LOYALTY_PROGRAM: true
}
```

---

## 📞 **TEAM COMMUNICATION SETUP**

### **Communication Channels**
- **Daily Updates:** Slack/Discord team channel
- **Code Reviews:** GitHub PR comments  
- **Urgent Issues:** Direct messages + team channel
- **Design Decisions:** Team video call if needed

### **File Sharing**
- **Code:** Git repository only
- **Screenshots:** Attach to PR or team chat
- **Documentation:** Markdown files in repository
- **Designs:** Figma/similar with team access

---

## ✅ **WORKSPACE INITIALIZATION CHECKLIST**

### **For Each Developer:**
```markdown
## Setup Checklist

### Environment Setup:
- [ ] Node.js 18+ installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` created with required variables  
- [ ] Development server starts (`npm run dev`)
- [ ] Can access localhost:3006

### Development Tools:
- [ ] VS Code with recommended extensions
- [ ] Git configured with proper credentials
- [ ] Database access verified (Supabase Studio)
- [ ] API testing tool setup (Postman/Insomnia)

### Team Integration:
- [ ] Added to team communication channel
- [ ] Read all team documentation files
- [ ] Understand daily standup process
- [ ] Know escalation procedures for blockers

### Code Standards:
- [ ] Understand TypeScript strict mode requirements
- [ ] Familiar with component patterns
- [ ] Know testing requirements for role
- [ ] Understand git workflow and PR process
```

---

## 🎯 **SUCCESS METRICS**

### **Team Readiness Indicators:**
- [ ] All developers can run project locally
- [ ] Shared types and utilities accessible to all
- [ ] Testing infrastructure functional
- [ ] Communication protocols established  
- [ ] Documentation complete and accessible

### **Development Efficiency Targets:**
- **Setup Time:** New developer productive within 2 hours
- **Build Time:** <30 seconds for development builds
- **Test Speed:** Full test suite completes <5 minutes
- **Deployment:** Feature branches deploy to staging automatically

---

## 🎉 **TEAM WORKSPACE READY!**

✅ **Shared development environment configured**  
✅ **Security and access controls in place**  
✅ **Testing infrastructure prepared**  
✅ **Communication channels established**  
✅ **Documentation and resources accessible**

**Next Steps:**
1. Each developer completes setup checklist
2. First daily standup to confirm readiness  
3. Begin parallel development on assigned features
4. Daily coordination using established protocols

**🚀 Ready for 2-week sprint to 100% feature completion!**