# Phone Number & Multi-Tenant Strategy

## 📞 Three Approaches for Phone Numbers

### **Option 1: Shared Assistant + Number Pool** ⭐ RECOMMENDED

```
Benefits:
✅ Cheapest (one Vapi assistant)
✅ Easiest to maintain 
✅ Consistent voice experience
✅ Centralized webhook logic

Cost: $29/month base + $2/month per phone number

Flow:
Business onboards → Auto-assign available number → Same AI assistant
Customer calls → Webhook identifies business by phone number → Routes correctly
```

**Implementation:**
```javascript
// During onboarding completion:
const phoneResult = await assignPhoneNumber(businessId, businessName);
// Assigns next available number from your pool
// All numbers use same assistant ID: '8ab7e000-aea8-4141-a471-33133219a471'

// Webhook receives:
{
  "call": { "phoneNumberId": "ph_abc123" },
  "toolCalls": [...] 
}

// Webhook looks up: phone_number_id → business_id → correct data
```

### **Option 2: Custom Assistant Per Business** 💰 EXPENSIVE

```
Benefits:
✅ Personalized greeting ("Thank you for calling Sparkle Nails!")
✅ Custom voice selection per salon
✅ Tailored prompts and personality

Cost: $29/month base + $29/month per assistant + $2/month per number

Flow:
Business onboards → Create custom assistant → Assign phone number
Each salon gets unique AI with their branding
```

### **Option 3: Bring Your Own Vapi Account** 🔧 COMPLEX

```
Benefits:
✅ Each salon pays their own Vapi bill
✅ Full control over their AI
✅ No pooled costs for you

Complexity:
❌ Each salon needs Vapi account
❌ Complex webhook routing
❌ Support burden for setup
```

## 🏗️ Recommended Architecture (Option 1)

### **Database Schema Addition:**

```sql
-- Add phone number tracking table
CREATE TABLE phone_numbers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    vapi_phone_id VARCHAR(50) UNIQUE NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    assigned_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast webhook lookups
CREATE INDEX idx_phone_numbers_vapi_id ON phone_numbers(vapi_phone_id);
```

### **Updated Onboarding Flow:**

```javascript
// Step 6 of onboarding wizard (NEW)
const completeOnboarding = async () => {
  // ... existing business setup ...
  
  // NEW: Auto-assign phone number
  const phoneResult = await assignPhoneNumber(business.id, business.name);
  
  if (phoneResult.success) {
    // Save phone mapping to database
    await supabase
      .from('phone_numbers')
      .insert({
        business_id: business.id,
        vapi_phone_id: phoneResult.phoneId,
        phone_number: phoneResult.phoneNumber
      });
      
    // Show success with phone number
    setPhoneNumber(phoneResult.phoneNumber);
  }
  
  setCurrentStep(6); // NEW completion step with phone number
};
```

### **Webhook Multi-Tenant Logic:**

```javascript
async function getBusinessIdFromCall(message) {
    if (message.call && message.call.phoneNumberId) {
        const { data } = await supabase
            .from('phone_numbers')
            .select('business_id')
            .eq('vapi_phone_id', message.call.phoneNumberId)
            .single();
            
        return data?.business_id || 'default-demo-id';
    }
    return 'default-demo-id';
}

// Now all functions work with correct business:
async function checkAvailability(args, businessId) {
    const { data: hours } = await supabase
        .from('business_hours')
        .select('*')
        .eq('business_id', businessId)  // ← Dynamic!
        .eq('day_of_week', dayOfWeek);
    // ... rest works automatically
}
```

## 💰 Cost Analysis

### **10 Salons Example:**

**Option 1 (Shared):**
- Base: $29/month
- 10 phone numbers: $20/month
- **Total: $49/month**

**Option 2 (Individual Assistants):**
- Base: $29/month
- 10 assistants: $290/month
- 10 phone numbers: $20/month
- **Total: $339/month**

**Recommendation:** Start with Option 1, upgrade to Option 2 when revenue justifies personalization.

## 🎯 Implementation Priority

### **Phase 1: Get Option 1 Working**
1. Add phone_numbers table to database
2. Update onboarding to assign phone numbers
3. Update webhook for business ID lookup
4. Test multi-tenant booking flow

### **Phase 2: Auto-Number Assignment**
1. Integrate Vapi API for number purchasing
2. Build number pool management
3. Handle number assignment errors gracefully
4. Add phone number to completion screen

### **Phase 3: Advanced Features (Optional)**
1. Custom assistant creation (Option 2)
2. Voice selection during onboarding
3. Personalized greetings per salon
4. Usage analytics per business

## 🚀 Quick Start Implementation

For now, you could manually assign numbers:

1. **Buy 5-10 numbers** in Vapi dashboard
2. **Configure all** to use your existing assistant
3. **Create lookup table** mapping phone IDs to businesses
4. **Test multi-tenant** booking with different numbers

This gives you immediate multi-tenant capability while you build the auto-assignment system!