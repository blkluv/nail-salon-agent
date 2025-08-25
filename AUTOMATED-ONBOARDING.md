# 🚀 Automated Salon Onboarding System

**Transform any nail salon into a fully automated AI-powered booking platform in under 5 minutes.**

## 🎯 What This Does

The automated onboarding system creates a complete multi-tenant SaaS platform for nail salons. Each new salon gets:

- **🤖 AI Voice Receptionist** - Natural language phone booking
- **📱 Dedicated Phone Number** - Professional Twilio number
- **🌐 Booking Website** - `salon-name.dropfly.ai`
- **📊 Admin Dashboard** - Staff, services, analytics management
- **💰 Payment Processing** - Integrated booking payments
- **📧 Email Confirmations** - Automated customer communications
- **📈 Analytics** - Real-time business insights

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Run interactive registration (full experience)
npm run register

# Try with demo data
npm run demo

# Test the automated onboarding system
npm run test:onboarding
```

## 🏗️ System Architecture

### Multi-Tenant Infrastructure
```
New Salon Signup
       ↓
1. Database Record (PostgreSQL)
       ↓  
2. Vapi Phone Number (Twilio)
       ↓
3. Vapi AI Assistant (GPT-4o)
       ↓
4. Booking Tools (4 functions)
       ↓
5. n8n Workflow (Dynamic routing)
       ↓
6. Live & Ready! 🎉
```

### Per-Salon Resources
Each salon gets isolated resources:
- **Database**: Business record with unique `webhook_token`
- **Phone Number**: Dedicated Twilio line via Vapi
- **AI Assistant**: Customized with salon name, hours, services
- **Webhook Endpoint**: `/webhook/{salon-slug}`
- **Booking Tools**: 4 Vapi functions (check/book/view/cancel)
- **n8n Workflow**: Routes by salon slug to correct database

## 📋 Required Environment Variables

```bash
# Vapi Integration
VAPI_API_KEY=your_vapi_api_key

# Database (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# n8n Workflow Engine  
N8N_API_URL=https://your-n8n.app.n8n.cloud/api/v1
N8N_API_KEY=your_n8n_api_key

# Platform Configuration
PLATFORM_DOMAIN=dropfly.ai  # Your domain
```

## 🎨 User Experience Flow

### Salon Owner Journey
1. **Sign Up** (2 mins)
   - Business info (name, address, phone)
   - Owner details (name, email)
   - Plan selection (starter/pro/enterprise)

2. **Automated Setup** (3 mins)
   - AI provisions phone number
   - Creates assistant with salon-specific prompts
   - Sets up booking workflow
   - Initializes database tables

3. **Go Live** (Instant)
   - Phone number active immediately
   - Booking website live
   - Dashboard accessible
   - Can start taking calls!

### Customer Journey
1. **Call** the salon's new AI phone number
2. **Speak naturally**: "I want a gel manicure tomorrow at 2 PM"
3. **AI handles everything**: checks availability, collects info, books appointment
4. **Confirmation**: Customer gets email confirmation instantly

## 🛠️ Core Components

### 1. `automated-onboarding.js`
**Master orchestrator** - Handles complete salon setup
- Database record creation
- Vapi phone number provisioning  
- AI assistant configuration
- Tool creation (check/book/cancel/view)
- n8n workflow deployment
- Error handling & cleanup

### 2. `enhanced-registration.js`
**Beautiful user experience** - Interactive salon signup
- Step-by-step information collection
- Plan selection with pricing
- Success screen with testing instructions
- Next steps guidance

### 3. `multi-tenant-workflow.json`
**Dynamic request routing** - Single n8n workflow handles all salons
- Extracts business slug from webhook path
- Loads salon data from database
- Routes to appropriate booking functions
- Returns formatted responses to Vapi

### 4. `multi-tenant-schema.sql`
**Database structure** - Complete multi-tenant schema
- Business isolation with RLS policies
- Customer management across salons
- Appointment booking system
- Payment tracking
- Analytics & reporting tables

## 🔧 Technical Implementation

### Phone Number Provisioning
```javascript
// Automatic Twilio number via Vapi
const phoneRequest = {
    provider: "twilio",
    areaCode: getAreaCodeFromState(business.state),
    name: `${business.name} - Main Line`,
    assistantId: null // Updated after assistant creation
};

const response = await axios.post(
    'https://api.vapi.ai/phone-number',
    phoneRequest,
    { headers: { 'Authorization': `Bearer ${vapiApiKey}` } }
);
```

### Dynamic AI Assistant Creation
```javascript
// Business-specific prompts and configuration
const assistantConfig = {
    name: `${business.name} Receptionist`,
    model: { provider: "openai", model: "gpt-4o" },
    voice: { provider: "11labs", voiceId: "sarah" },
    firstMessage: `Hi! Welcome to ${business.name}!...`,
    toolIds: tools.map(tool => tool.id)
};

const assistant = await vapi.createAssistant(assistantConfig);
```

### Multi-Tenant Webhook Routing
```javascript
// Extract business from webhook path: /webhook/{slug}
const businessSlug = webhookPath.match(/\/webhook\/([a-zA-Z0-9-]+)/)[1];

// Load business data and validate token
const business = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', businessSlug)
    .single();

// Route to appropriate booking function
switch (requestData.tool) {
    case 'check_availability': return checkAvailability(business, params);
    case 'book_appointment': return bookAppointment(business, params);
    // etc...
}
```

## 📊 Scalability Features

### Database Optimization
- **Row Level Security** - Automatic data isolation
- **Indexing Strategy** - Optimized for multi-tenant queries
- **Connection Pooling** - Efficient resource usage
- **Audit Logging** - Track all booking activities

### Performance Monitoring
- **Response Times** - Track API latency
- **Success Rates** - Monitor booking completion
- **Error Handling** - Graceful failures with cleanup
- **Resource Usage** - Database, API call tracking

### Auto-Scaling Components
- **n8n Workflows** - Shared workflow scales with load
- **Database** - Supabase auto-scaling
- **Vapi Assistant** - Per-call pricing model
- **Phone Numbers** - On-demand provisioning

## 🧪 Testing System

### Automated Test Suite
```bash
# Run full test suite
npm run test:onboarding

# Tests include:
# ✅ Environment validation
# ✅ Database connectivity  
# ✅ Vapi API connection
# ✅ Complete onboarding flow
# ✅ Data validation
# ✅ Cleanup verification
```

### Manual Testing
```bash
# Create demo salon
npm run demo

# Test the phone number immediately
# Call and say: "I want to book a gel manicure for tomorrow at 2 PM"
```

## 💰 Economics & Pricing

### Per-Salon Costs (Monthly)
- **Twilio Number**: $1.15
- **Vapi Usage**: ~$10-30 (call volume dependent)
- **Database**: ~$0.50 (shared PostgreSQL)
- **Total Cost**: ~$12-32/month per salon

### Revenue Model
- **Starter**: $49/month (400%+ margin)
- **Professional**: $99/month (300%+ margin)  
- **Enterprise**: $199/month (600%+ margin)

### Break-Even Analysis
- **10 salons**: $490/month revenue, ~$320 costs = $170 profit
- **100 salons**: $4,900/month revenue, ~$3,200 costs = $1,700 profit
- **1,000 salons**: $49,000/month revenue, ~$32,000 costs = $17,000 profit

## 🚀 Deployment Guide

### Production Environment Setup

1. **Database (Supabase)**
   ```bash
   # Run schema migration
   psql -h your-host -d your-db -f config/multi-tenant-schema.sql
   ```

2. **Workflow Engine (n8n)**
   ```bash
   # Import master workflow
   curl -X POST "https://your-n8n.app.n8n.cloud/api/v1/workflows" \
        -H "X-N8N-API-KEY: $N8N_API_KEY" \
        -d @config/multi-tenant-workflow.json
   ```

3. **Domain Configuration**
   ```bash
   # Set up wildcard DNS for salon subdomains
   *.dropfly.ai → Load Balancer → Onboarding Service
   admin.dropfly.ai → Dashboard Application
   ```

4. **Monitoring Setup**
   ```bash
   # Health check endpoint
   curl https://api.dropfly.ai/health
   
   # Metrics dashboard
   https://grafana.dropfly.ai/dashboards/salon-metrics
   ```

### High-Availability Configuration
- **Load Balancing**: Multiple API instances
- **Database Replication**: Primary/secondary setup
- **CDN**: Static assets and booking widgets
- **Monitoring**: Uptime, performance, error tracking

## 📈 Growth Strategy

### Phase 1: Local Market (0-50 salons)
- Target single metro area
- Direct sales approach
- Manual onboarding with white-glove support

### Phase 2: Regional Expansion (50-500 salons)
- Multi-state rollout
- Partner channel development
- Automated onboarding system (this!)

### Phase 3: National Scale (500+ salons)
- Franchise partnerships
- API marketplace
- White-label platform options

## 🔒 Security & Compliance

### Data Protection
- **Encryption**: AES-256 for data at rest, TLS 1.3 for transit
- **Authentication**: Row-level security with business isolation
- **Audit Logs**: All booking activities tracked
- **Backup Strategy**: Daily automated backups

### Compliance Standards
- **PCI DSS**: Payment data handling (via Stripe)
- **GDPR**: Customer data privacy controls  
- **CCPA**: California privacy compliance
- **SOC 2**: Security & availability controls

## 🎯 Success Metrics

### Onboarding KPIs
- **Time to Live**: Target <5 minutes
- **Success Rate**: Target >95%
- **Error Recovery**: Automatic cleanup on failures
- **First Call Success**: AI answers correctly >90%

### Business Metrics
- **Monthly Recurring Revenue**: Track per-salon
- **Churn Rate**: Target <5% monthly
- **Customer Acquisition Cost**: Target <$50
- **Lifetime Value**: Track long-term retention

## 🤝 Support & Maintenance

### Customer Support Tiers
- **Starter**: Email support, knowledge base
- **Professional**: Priority email + phone support
- **Enterprise**: Dedicated success manager + SLA

### System Maintenance
- **Monitoring**: 24/7 uptime monitoring
- **Updates**: Automated deployment pipeline
- **Scaling**: Auto-scaling based on load
- **Backup**: Continuous data protection

---

## 🎉 Ready to Scale!

This automated onboarding system transforms salon acquisition from a manual, time-intensive process into a scalable, self-service experience. New salons go from signup to taking AI-powered bookings in under 5 minutes.

**Get started:**
```bash
npm run quick-start
```

**Questions?** Open an issue or contact [support@dropfly.ai](mailto:support@dropfly.ai)