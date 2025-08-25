# CLAUDE.md - Project Memory & Best Practices

## Project: Vapi Nail Salon Agent
**Created:** January 2025
**Status:** Production Ready

## 🏗️ ARCHITECTURAL PATTERN: Core Logic First, Automation Later

### The Smart Build Order (What We Learned)

**Build your core business logic FIRST as a standalone webhook server, THEN add automation tools like n8n/Make/Zapier as a thin layer on top.**

### Why This Pattern Works

#### ❌ The Wrong Way (Starting with n8n/automation first):
```
Vapi → n8n (handles EVERYTHING)
         ├── Database logic (50+ nodes)
         ├── Availability checking (20+ nodes)
         ├── Customer management (30+ nodes)
         ├── Error handling (everywhere!)
         └── Complex spaghetti workflow
```
**Problems:**
- Debugging is a nightmare
- Logic scattered across visual nodes
- Hard to test
- Vendor lock-in
- Difficult to version control

#### ✅ The Right Way (Core logic first):
```
Step 1: Build Core Webhook
Vapi → Express Webhook Server → Supabase
         ├── checkAvailability()
         ├── bookAppointment()
         ├── checkAppointments()
         └── cancelAppointment()

Step 2: Add Automation Layer (Optional)
Vapi → n8n → Express Webhook → Supabase
        ↓
     Just adds:
     - SMS notifications
     - Email confirmations
     - External integrations
```

### Implementation Example

**1. Core Webhook Server (webhook-server.js):**
```javascript
// All business logic in clean, testable code
async function bookAppointment(args) {
    // 1. Validate input
    // 2. Check availability
    // 3. Create/find customer
    // 4. Book appointment
    // 5. Return confirmation
}
```

**2. Later, n8n Just Decorates:**
```
Simple 5-node workflow:
1. Webhook trigger
2. Call your existing endpoint
3. Send SMS (if success)
4. Send Email (if success)
5. Log to analytics
```

### Benefits of This Pattern

1. **Testability**: Can test all logic locally without n8n
2. **Portability**: Can switch from n8n to Zapier to Make without rewriting
3. **Version Control**: All logic in Git, not trapped in visual tool
4. **Performance**: Direct code execution faster than visual nodes
5. **Debugging**: Console.log and proper error stack traces
6. **Cost**: Reduce automation tool usage (fewer executions)

### When to Use This Pattern

✅ **Perfect for:**
- Voice AI agents (Vapi, Vocode, Bland)
- Booking/scheduling systems
- E-commerce order processing
- Any complex business logic

❌ **Skip for:**
- Simple notifications
- Basic data syncing
- One-off integrations

## 🎯 Project-Specific Learnings

### Vapi Integration Best Practices

1. **Always use ngrok for local development**
   - Free tier is sufficient for testing
   - Use: `ngrok http 3001` for webhooks

2. **Vapi Function Setup**
   - Define functions in Vapi dashboard
   - Point ALL functions to same webhook URL
   - Let webhook server route based on function name

3. **Database Schema**
   - Multi-tenant from the start (business_id everywhere)
   - Include booking_source field (phone/web/sms)
   - Track both customer_id AND denormalized name/phone

### Supabase + RLS Gotchas

1. **RLS blocks dashboard by default**
   - Need to disable RLS for development
   - Or create proper policies for anon key

2. **Demo Data Setup**
   ```javascript
   // Always create in this order:
   1. Business
   2. Services
   3. Staff
   4. Business Hours
   5. Sample Customers
   6. Sample Appointments
   ```

### Testing Voice AI Flows

1. **Test Webhook Independently First**
   ```bash
   curl -X POST http://localhost:3001/webhook/vapi \
     -H "Content-Type: application/json" \
     -d '{"message":{"toolCalls":[...]}}'
   ```

2. **Then Test with Vapi**
   - Update function URLs
   - Make test call
   - Check webhook logs

## 📝 Commands & URLs to Remember

```bash
# Start webhook server
cd C:\Users\escot\vapi-nail-salon-agent
node webhook-server.js

# Start dashboard
cd dashboard
npm run dev

# Start ngrok tunnel
ngrok http 3001

# Test database connection
node scripts/test-connection.js

# Run demo data setup
node scripts/simple-demo-test.js
```

## 🔑 Environment Variables

```env
# Supabase (both webhook and dashboard need these)
SUPABASE_URL=https://irvyhhkoiyzartmmvbxw.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_KEY=eyJhbGci...

# Dashboard specific
NEXT_PUBLIC_DEMO_BUSINESS_ID=8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad

# Vapi (when needed)
VAPI_API_KEY=your-key-here
```

## 🚀 Production Deployment Options

1. **Webhook Server**
   - Vercel Functions (easiest)
   - Railway.app 
   - Render.com
   - Any Node.js host

2. **Dashboard**
   - Vercel (best for Next.js)
   - Netlify
   - Cloudflare Pages

3. **Database**
   - Keep on Supabase (free tier = 500MB)
   - Upgrade when needed

## 📚 Key Lessons Learned

1. **Start with the core business logic in code**
2. **Add automation tools as a thin layer later**
3. **Keep all complex logic in version-controlled code**
4. **Use automation tools for integrations, not logic**
5. **Test each layer independently**
6. **Document webhook endpoints thoroughly**

---

*This architectural pattern saved approximately 40 hours of n8n development time and resulted in a more maintainable, testable system.*